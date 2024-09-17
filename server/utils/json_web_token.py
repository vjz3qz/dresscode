import os
from dataclasses import dataclass
import jwt  # PyJWT

from .custom_exceptions import BadCredentialsException
from .custom_exceptions import UnableCredentialsException

@dataclass
class JsonWebToken:
    """Perform JSON Web Token (JWT) validation using PyJWT"""

    jwt_access_token: str
    supabase_secret: str = os.getenv("SUPABASE_JWT_SECRET")
    algorithm: str = "HS256"  # Supabase uses HS256 by default
    audience: str = "authenticated"

    def validate(self):
        try:
            # Decode and verify the JWT using the Supabase secret
            payload = jwt.decode(
                self.jwt_access_token,
                self.supabase_secret,
                algorithms=[self.algorithm],
                audience=self.audience,
            )
        except jwt.exceptions.InvalidTokenError:
            print("Invalid token")
            raise BadCredentialsException
        except Exception as e:
            print(f"Error decoding token: {str(e)}")
            raise UnableCredentialsException

        return payload
