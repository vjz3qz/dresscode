from openai import OpenAI

class OpenAIChatClient:
    def __init__(self, model="gpt-4o", prompt="You are a helpful assistant.", temperature=0.7):
        self.client = OpenAI()
        self.model = model
        self.prompt = prompt
        self.temperature = temperature # unused for now

    def send_text_query(self, messages, max_tokens=3000):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens
        )
        return response.choices[0].message

    def send_simple_text_query(self, text):
        messages = [
            {"role": "developer", "content": self.prompt},
            {"role": "user", "content": text}
        ]
        return self.send_text_query(messages)

    def send_image_query(self, text, image_urls, max_tokens=3000):
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
