import json
from openai import OpenAI

class OpenAIChatClient:
    def __init__(self, model="gpt-4o", prompt="You are a helpful assistant.", temperature=0.7):
        self.client = OpenAI()
        self.model = model
        self.prompt = prompt
        self.temperature = temperature  # Currently unused in the requests below

    def send_text_query(self, messages, max_tokens=3000):
        """
        Sends a text-based conversation to the model and returns the final message object.
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens
        )
        return response.choices[0].message

    def send_simple_text_query(self, text):
        """
        A helper for quick text-based queries with a single user prompt.
        """
        messages = [
            {"role": "developer", "content": self.prompt},
            {"role": "user", "content": text}
        ]
        return self.send_text_query(messages)

    def send_image_query(self, text, image_urls, max_tokens=3000):
        """
        Sends a text + image query to the model and returns the textual response.
        """
        messages = [
            {"role": "developer", "content": self.prompt},
            {"role": "user", "content": [{"type": "text", "text": text}]}
        ]

        for url in image_urls:
            messages[1]["content"].append({"type": "image_url", "image_url": {"url": url}})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content


    def pick_outfit_for_occasion(self, occasion, items, batch_size=5, max_tokens=3000):
        """
        Iteratively processes a large list of clothing items in batches, building an outfit
        suitable for the given 'occasion.' The final selection is returned in JSON.

        - Each batch is turned into one user message that contains:
          1) A text block with the occasion & current selection
          2) For each item in the batch:
             - A text block describing the item in JSON (or partial JSON)
             - An image block with the item's 'image_url' (if available)
          3) A final text block requesting an updated outfit selection.
        """

        # Developer-level instructions:
        system_prompt = """\
You are an expert fashion stylist. Your goal is to help select an outfit for a specific occasion.
You have access to a list of clothing items (in JSON + image form).
For each batch of items, you will see:
- The user's specified occasion
- The current selection so far
- A small set of items (each with metadata and an image URL, if provided)

Your job is to:
1. Update or refine the outfit selection based on the new items.
2. Return the updated selection in JSON, for example:
{
  "selected_items": [
    { "id": 123, "reason": "It matches the summer vibe and color." }
  ],
  "notes": "A short explanation of the overall reasoning."
}

Constraints:
- Only choose items that make sense together (consistent style, season, color, etc.).
- You can replace previously chosen items if something better appears.
- You may keep or remove previously selected items if needed.
- If multiple good options appear, pick what you think is best for the occasion.

After all batches, you will be asked for a final confirmation of the outfit.
"""

        messages = [
            {"role": "developer", "content": system_prompt}
        ]

        # We store the currently selected outfit as a Python list of dicts:
        current_selection = []

        def build_batch_message(occasion_text, selection, batch):
            """
            Builds the user message content array, containing text blocks + image blocks.
            The final block asks the model to update the outfit selection.
            """
            content_array = []

            # 1) Text block: occasion + current selection
            selection_str = json.dumps(selection, indent=2)
            intro_text = f"""Occasion: {occasion_text}

Current Selected Items (So Far):
{selection_str}

Here is a new batch of items to consider:
"""
            content_array.append({"type": "text", "text": intro_text})

            # 2) For each item, add a text block with metadata + an image block (if item has image_url)
            for idx, item in enumerate(batch, start=1):
                # Create a short metadata text
                # You can either embed entire JSON or just the relevant fields
                # lets filter out irrelevant fields
                # For example, we only keep the name and price fields
                filtered_item = {k: v for k, v in item.items() if k in ["name", "type", "color", "brand", "category", "season", "material", "style", "is_favorite", "condition", "tags", "fit"]}
                item_json_str = json.dumps(filtered_item, indent=2)
                metadata_text = f"Item #{idx} metadata:\n{item_json_str}\n"
                content_array.append({"type": "text", "text": metadata_text})

                # If the item has an image_url, add an image block
                if "image_url" in item and item["image_url"]:
                    content_array.append({
                        "type": "image_url",
                        "image_url": {"url": item["image_url"]}
                    })

            # 3) Final text block asking to update the selection
            request_text = """Please update the outfit selection. 
You may keep, replace, or add items for the best outfit. 
Return the updated selection as JSON."""
            content_array.append({"type": "text", "text": request_text})

            return content_array

        # Iterate over the item list in small batches
        for i in range(0, len(items), batch_size):
            batch = items[i : i + batch_size]

            # Build the message content for this batch
            content_for_batch = build_batch_message(occasion, current_selection, batch)

            # Add to the conversation
            messages.append({
                "role": "user",
                "content": content_for_batch
            })

            # Send it to the model
            response_msg = self.send_text_query(messages, max_tokens=max_tokens)
            print("response", response_msg)
            model_response_text = response_msg.content
            # Record the assistant's message so context is preserved
            messages.append({"role": "assistant", "content": model_response_text})

            # Try to parse JSON for "selected_items"
            try:
                parsed = json.loads(model_response_text)
                new_selection = parsed.get("selected_items", [])
                current_selection = new_selection
            except json.JSONDecodeError:
                # If parsing fails, keep the old selection
                pass

        # After all batches, do a final check
        final_check_text = f"""
We have processed all items. 
Here is your final selection so far:
{json.dumps(current_selection, indent=2)}

Is this selection good for the occasion: '{occasion}'?
If not, please revise it. Return the final selection in the same JSON format.
"""
        messages.append({"role": "user", "content": final_check_text})
        final_response_msg = self.send_text_query(messages, max_tokens=max_tokens)
        final_model_response = final_response_msg.content
        print("final", final_model_response)
        messages.append({"role": "assistant", "content": final_model_response})

        # Parse the final JSON if possible
        final_selected_items = current_selection
        final_notes = ""
        try:
            parsed_final = json.loads(final_model_response)
            final_selected_items = parsed_final.get("selected_items", [])
            final_notes = parsed_final.get("notes", "")
        except json.JSONDecodeError:
            pass

        # Return the final chosen outfit in Python dict
        return {
            "selected_items": final_selected_items,
            "notes": final_notes
        }
# ------------------
# Example usage:
# ------------------
if __name__ == "__main__":
    # Example: list of clothing items
    all_items = [
        {
            "id": 101,
            "name": "Red T-Shirt",
            "color": "red",
            "material": "cotton",
            "season": ["summer"],
            "style": ["casual"],
            "brand": "Acme",
            "category": "tops"
        },
        {
            "id": 102,
            "name": "Black Jeans",
            "color": "black",
            "material": "denim",
            "season": ["spring", "fall", "winter"],
            "style": ["casual", "urban"],
            "brand": "DenimCo",
            "category": "pants"
        },
        {
            "id": 103,
            "name": "Blue Hoodie",
            "color": "blue",
            "material": "fleece",
            "season": ["fall", "winter"],
            "style": ["casual", "sporty"],
            "brand": "CozyWear",
            "category": "outerwear"
        },
        # ... (more items as needed)
    ]

    # Initialize our OpenAI client
    client = OpenAIChatClient(model="gpt-4o")

    # Use the new method to pick an outfit for a given occasion
    occasion_description = "Outdoor party in late summer, casual but stylish"
    result = client.pick_outfit_for_occasion(occasion_description, all_items, batch_size=2)

    print("Final outfit selection:")
    print(json.dumps(result, indent=2))
