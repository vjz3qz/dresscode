import datetime
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from openai import OpenAI

class SelectedItem(BaseModel):
    id: int = Field(..., description="The unique ID of the selected clothing item")
    reason: str = Field(..., description="Why this item was chosen for the outfit")

class OutfitSelection(BaseModel):
    selected_items: List[SelectedItem]
    notes: str


from pydantic import BaseModel, Field
from typing import Optional, List

class ExtractedItem(BaseModel):
    color: Optional[str] = Field(None, description="Primary color of the item")
    brand: Optional[str] = Field(None, description="Brand name of the item")
    category: Optional[str] = Field(None, description="Category of the item (e.g., tops, pants, shoes, accessory)")
    season: Optional[List[str]] = Field(None, description="Applicable seasons for the item (e.g., ['winter', 'fall'])")
    material: Optional[str] = Field(None, description="Fabric or material type of the item")
    style: Optional[List[str]] = Field(None, description="Applicable styles of the item (e.g., ['casual', 'formal'])")
    condition: Optional[str] = Field(None, description="Condition of the item (e.g., 'new', 'worn', 'vintage')")



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
    
    def extract_item_information(self, item_image_url, max_tokens=3000):
        system_prompt = """You're a fashion advisor. Your task is to analyze and categorize an image of clothing with precision.

1. Determine the fabric (cotton, denim, wool, silk, etc.) of the item.
2. Identify the color of the item 
3. Identify the pattern of the item (e.g., stripes, polka dots, floral, etc.) 
4. Describe the item in detail
5. Identify any relevant attributes such as style (formal, casual, athletic, vintage, etc.), season (e.g., winter coat, summer dress), occasion (formal, casual, etc.), brand, and any other details that could help in recommending outfits later on. Consolidate these attributes into tags that add unique value and do not overlap with the category, fabric, or color.

Be specific and thorough in your analysis to ensure accurate and useful recommendations.

ALWAYS return valid JSON according to the schema."""

        messages = [
            {"role": "developer", "content": system_prompt}
        ]
        messages.append({
            "role": "user", "content": [{"type": "image_url", "image_url": {"url": item_image_url}}]
        })
            
        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=messages,
            response_format=ExtractedItem,
            max_tokens=max_tokens
        )
        if completion.choices[0].message.refusal:
            # The model refused for safety or policy reasons
            print("Model refused with message:", completion.choices[0].message.refusal)
            return None
        else:
            extracted_item = completion.choices[0].message.parsed
            return extracted_item



    def suggest_outfit_for_occasion(self, occasion, items, batch_size=5, max_tokens=3000):
        """
        Iteratively processes a large list of clothing items in batches, building an outfit
        suitable for the given 'occasion.' The final selection is returned in the structured
        JSON format defined by OutfitSelection.
        """
        system_prompt = """\
You are an expert fashion stylist. Your goal is to help select an outfit for a specific occasion.
You have access to a list of clothing items (in JSON + image form).
For each batch of items, you will see:
- The user's specified occasion
- The current selection so far
- A small set of items (each with metadata and an image URL, if provided)

Your job:
1. Update or refine the outfit selection based on the new items.
2. Return the updated selection as JSON with the following format:
{
  "selected_items": [
    { "id": <integer>, "reason": <string> }
  ],
  "notes": <string>
}

Constraints:
- Only choose items that make sense together (consistent style, color, season).
- You can replace previously chosen items if something better appears.
- Keep or remove previously selected items if needed.
- If multiple good options appear, pick the best for the occasion.

ALWAYS return valid JSON according to the schema.
"""

        messages = [
            {"role": "developer", "content": system_prompt}
        ]

        # We'll store the current outfit selection as we go
        current_selection = []
        current_notes = ""

        def build_batch_message(occasion_text, selection, batch):
            content_array = []

            # Convert Pydantic items to dicts so we can JSON-encode them
            selection_dicts = []
            for item in selection:
                # If 'item' is a Pydantic model, convert to dict
                selection_dicts.append(item.model_dump())
            
            selection_str = json.dumps(selection_dicts, indent=2)  # Now it's serializable
            intro_text = (
                f"Occasion: {occasion_text}\n\n"
                f"Current Selected Items (So Far):\n{selection_str}\n\n"
                "Here is a new batch of items to consider:\n"
            )
            content_array.append({"type": "text", "text": intro_text})

            for idx, item in enumerate(batch, start=1):
                filtered_item = {
                    k: v for k, v in item.items()
                    if k in [
                        "id", "name", "color", "material", "season",
                        "style", "brand", "category", "type",
                        "is_favorite", "condition", "tags", "fit"
                    ]
                }
                item_json_str = json.dumps(filtered_item, indent=2)
                metadata_text = f"Item #{idx} metadata:\n{item_json_str}\n"
                content_array.append({"type": "text", "text": metadata_text})

                if "image_url" in item and item["image_url"]:
                    content_array.append({
                        "type": "image_url",
                        "image_url": {"url": item["image_url"]}
                    })

            request_text = (
                "Please update the outfit selection. "
                "You may keep, replace, or add items for the best outfit. "
                "Return the updated selection in valid JSON according to the schema."
            )
            content_array.append({"type": "text", "text": request_text})

            return content_array

        # Process items in batches
        for i in range(0, len(items), batch_size):
            batch = items[i : i + batch_size]
            
            content_for_batch = build_batch_message(occasion, current_selection, batch)
            messages.append({"role": "user", "content": content_for_batch})
            
            completion = self.client.beta.chat.completions.parse(
                model=self.model,
                messages=messages,
                response_format=OutfitSelection,
                max_tokens=max_tokens
            )

            if completion.choices[0].message.refusal:
                # The model refused for safety or policy reasons
                print("Model refused with message:", completion.choices[0].message.refusal)
            else:
                parsed = completion.choices[0].message.parsed
                # Update the current selection & notes
                current_selection = parsed.selected_items
                current_notes = parsed.notes

            # Add the assistant’s last message to context
            last_message = completion.choices[0].message.content
            messages.append({"role": "assistant", "content": last_message})

        # Convert Pydantic items to dicts so we can JSON-encode them
        current_selection_dicts = []
        for item in current_selection:
            # If 'item' is a Pydantic model, convert to dict
            current_selection_dicts.append(item.model_dump())

        # After all batches, ask for a final check
        final_check = (
            "We have processed all items.\n"
            f"Here is your final selection so far:\n{json.dumps(current_selection_dicts, indent=2)}\n\n"
            f"Is this selection good for the occasion: '{occasion}'?\n"
            "If not, please revise it. Return the final selection in the same JSON format."
        )
        messages.append({"role": "user", "content": final_check})

        final_completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=messages,
            response_format=OutfitSelection,
            max_tokens=max_tokens
        )

        if final_completion.choices[0].message.refusal:
            print("Final completion refused:", final_completion.choices[0].message.refusal)
            return {
                "selected_items": current_selection,
                "notes": current_notes
            }
        else:
            final_parsed = final_completion.choices[0].message.parsed
            return {
                "selected_items": final_parsed.selected_items,
                "notes": final_parsed.notes
            }
# ------------------
# Example usage:
# ------------------
if __name__ == "__main__":
    # Example item list
    all_items = [
        {
            "id": 101,
            "name": "Red T-Shirt",
            "color": "red",
            "material": "cotton",
            "season": ["summer"],
            "style": ["casual"],
            "brand": "Acme",
            "category": "tops",
            "image_url": ""
        },
        {
            "id": 102,
            "name": "Black Jeans",
            "color": "black",
            "material": "denim",
            "season": ["spring", "fall", "winter"],
            "style": ["casual", "urban"],
            "brand": "DenimCo",
            "category": "pants",
            "image_url": ""
        },
        {
            "id": 103,
            "name": "Blue Hoodie",
            "color": "blue",
            "material": "fleece",
            "season": ["fall", "winter"],
            "style": ["casual", "sporty"],
            "brand": "CozyWear",
            "category": "outerwear",
            "image_url": ""
        },
    ]

    client = OpenAIChatClient(model="gpt-4o")
    result = client.pick_outfit_for_occasion(
        "Outdoor party in late summer, casual but stylish",
        all_items,
        batch_size=2
    )

    selected_items = result["selected_items"]
    print("---- Selected Items ----")


    # Convert Pydantic items to dicts so we can JSON-encode them
    current_selection_dicts = []
    for item in selected_items:
        # If 'item' is a Pydantic model, convert to dict
        current_selection_dicts.append(item.model_dump())

    print(current_selection_dicts)

    print("---- Final Structured Output ----")
    print(result["notes"])
