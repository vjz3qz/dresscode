import os
import boto3
from rembg import remove
from PIL import Image
from io import BytesIO

# Initialize S3 client
s3 = boto3.client('s3')

def upload_image_to_s3(bucket_name, key, image_path):
    with open(image_path, 'rb') as f:
        s3.put_object(Bucket=bucket_name, Key=key, Body=f, ContentType='image/jpeg')

    print(f'Image uploaded to s3://{bucket_name}/{key}')

def process_image_s3(bucket_name, input_key, output_key):
    # Download the image from S3
    s3_response = s3.get_object(Bucket=bucket_name, Key=input_key)
    input_image = Image.open(BytesIO(s3_response['Body'].read()))

    # Remove the background
    output_image = remove(input_image)

    # Save the result to a BytesIO object
    output_buffer = BytesIO()
    output_image.save(output_buffer, format='PNG')
    output_buffer.seek(0)

    # Upload the processed image back to S3
    s3.put_object(Bucket=bucket_name, Key=output_key, Body=output_buffer, ContentType='image/png')

    print(f'Processed image saved to {output_key} in bucket {bucket_name}')

# Example usage
process_image_s3(
    bucket_name=os.getenv('S3_BUCKET_NAME'),
    input_key='01.jpg',
    output_key='01.png'
)
