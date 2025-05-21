from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from logging import getLogger

logger = getLogger(__name__)

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

    def __call__(self, request):
        logger.debug(f"JWTMiddleware: Request path: {request.path}, Cookies: {request.COOKIES}, Headers: {request.META}")
        try:
            if 'access_token' in request.COOKIES:
                token = request.COOKIES['access_token']
                logger.debug(f"JWTMiddleware: Token found in cookie: {token}")
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
                result = self.jwt_auth.authenticate(request)
                if result is not None:
                    user, _ = result
                    request.user = user
                    logger.debug(f"JWTMiddleware: User authenticated: {user}")
                else:
                    logger.debug("JWTMiddleware: Authentication returned None")
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
        response = self.get_response(request)
        return response
