from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)
User = get_user_model()


class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

    def __call__(self, request):
        logger.debug(
            f"JWTMiddleware: Request path: {request.path}, Cookies: {request.COOKIES}, Headers: {request.META}")

        # Domyślnie ustawiamy AnonymousUser
        request.user = AnonymousUser()

        try:
            if 'access_token' in request.COOKIES:
                token = request.COOKIES['access_token']
                logger.debug(f"JWTMiddleware: Token found in cookie: {token}")
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
                user, _ = self.jwt_auth.authenticate(request)
                if user is not None:
                    request.user = user
                    logger.debug(f"JWTMiddleware: User authenticated: {user}")
                else:
                    logger.debug("JWTMiddleware: User is None after authentication")
                    request.user = AnonymousUser()
            else:
                logger.debug("JWTMiddleware: No access token found in cookie")
                request.user = AnonymousUser()
        except AuthenticationFailed as e:
            logger.error(f"JWTMiddleware: Authentication failed: {str(e)}")
            request.user = AnonymousUser()
        except Exception as e:
            logger.error(f"JWTMiddleware: Unexpected error: {str(e)}")
            request.user = AnonymousUser()

        # Log po ustawieniu request.user
        logger.debug(
            f"JWTMiddleware: Final request.user: {request.user}, Authenticated: {request.user.is_authenticated}")

        response = self.get_response(request)
        return response