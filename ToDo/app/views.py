from datetime import datetime
import hashlib
from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import json
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task, UserAccount
from .serializers import TaskSerializer

logger = logging.getLogger(__name__)

# HTML Views
def home(request):
    """Renders the home page (index.html - task list)."""
    assert isinstance(request, HttpRequest)
    logger.debug(f"Home view: User: {request.user}, Authenticated: {request.user.is_authenticated if request.user else False}, Cookies: {request.COOKIES}")
    if not request.user or not request.user.is_authenticated:
        logger.debug("User not authenticated, redirecting to start")
        return redirect('start')
    logger.debug(f"User {request.user} authenticated, rendering index page")
    return render(
        request,
        'app/index.html',
        {
            'title': 'ToDo List',
            'year': datetime.now().year,
        }
    )

def start_view(request):
    """Renders the start page (login page)."""
    logger.debug(f"Start view: User: {request.user}, Authenticated: {request.user.is_authenticated if request.user else False}, Cookies: {request.COOKIES}")
    if request.user and request.user.is_authenticated:
        logger.debug(f"User {request.user} already authenticated, redirecting to home")
        return redirect('home')
    return render(
        request,
        'app/start.html',
        {
            'title': 'Login - ToDo',
            'year': datetime.now().year,
        }
    )

def register_view(request):
    """Renders the register page."""
    if request.user and request.user.is_authenticated:
        logger.debug(f"User {request.user} already authenticated, redirecting to home")
        return redirect('home')
    return render(
        request,
        'app/register.html',
        {
            'title': 'Register - ToDo',
            'year': datetime.now().year,
        }
    )

def edit_requests_view(request):
    """Renders the edit requests page for task management."""
    if not request.user or not request.user.is_authenticated:
        logger.debug("User not authenticated, redirecting to start")
        return redirect('start')
    return render(
        request,
        'app/edit_requests.html',
        {
            'title': 'Edit Tasks - ToDo',
            'year': datetime.now().year,
        }
    )

# API Endpoints
@csrf_exempt
def api_register(request):
    """API endpoint for user registration."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirmPassword')

            if not email or not password or not confirm_password:
                logger.warning("Missing required fields in registration request")
                return JsonResponse({'success': False, 'message': 'All fields are required'}, status=400)

            if password != confirm_password:
                logger.warning("Passwords do not match")
                return JsonResponse({'success': False, 'message': 'Passwords do not match'}, status=400)

            if (
                len(password) < 6 or
                len(password) > 20 or
                not any(c.islower() for c in password) or
                not any(c.isupper() for c in password) or
                not any(c.isdigit() for c in password)
            ):
                logger.warning("Password does not meet requirements")
                return JsonResponse(
                    {'success': False, 'message': 'Password must be 6 to 20 characters long and include a lowercase letter, an uppercase letter, and a number'},
                    status=400
                )

            if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
                logger.warning(f"Email {email} already exists")
                return JsonResponse({'success': False, 'message': 'Email already exists'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password)
            user.save()
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({
                'success': True,
                'message': 'Registration successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                httponly=True,
                samesite='Lax',
                secure=False,
                max_age=3600,
                path='/',
                domain=None,
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                samesite='Lax',
                secure=False,
                max_age=86400,
                path='/',
                domain=None,
            )
            logger.info(f"User {email} registered successfully")
            return response
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error during registration: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Server error'}, status=500)
    logger.warning("Invalid HTTP method in api_register")
    return JsonResponse({'success': False, 'message': 'Invalid method'}, status=405)

@csrf_exempt
def api_login(request):
    """API endpoint for user login."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                logger.warning("Missing email or password in login request")
                return JsonResponse({'success': False, 'message': 'Email and password are required'}, status=400)

            user = authenticate(request, username=email, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
                response = JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                })
                response.set_cookie(
                    'access_token',
                    str(refresh.access_token),
                    httponly=True,
                    samesite='Lax',
                    secure=False,
                    max_age=3600,
                    path='/',
                    domain=None,
                )
                response.set_cookie(
                    'refresh_token',
                    str(refresh),
                    httponly=True,
                    samesite='Lax',
                    secure=False,
                    max_age=86400,
                    path='/',
                    domain=None,
                )
                logger.info(f"User {email} logged in successfully with JWT")
                return response
            else:
                logger.warning(f"Failed login attempt for email {email}")
                return JsonResponse({'success': False, 'message': 'Invalid email or password'}, status=400)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error during login: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Server error'}, status=500)
    logger.warning("Invalid HTTP method in api_login")
    return JsonResponse({'success': False, 'message': 'Invalid method'}, status=405)
@csrf_exempt
def custom_login(request):
    if request.method != "POST":
        return JsonResponse({'success': False, 'message': 'Invalid method'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({'success': False, 'message': 'Missing credentials'}, status=400)

        password_hash = hashlib.sha256(password.encode()).hexdigest()
        user = UserAccount.objects.filter(email=email, password_hash=password_hash).first()

        if user:
            return JsonResponse({'success': True, 'message': 'Authenticated'})
        return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
    except Exception as e:
        logger.error(f"Login error: {e}")
        return JsonResponse({'success': False, 'message': 'Server error'}, status=500)

# Task API
class TaskViewSet(viewsets.ModelViewSet):
    """API for managing tasks."""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return tasks for the authenticated user only."""
        logger.debug(f"TaskViewSet: User: {self.request.user}")
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Assign the task to the authenticated user."""
        serializer.save(user=self.request.user)

@csrf_exempt
def api_logout(request):
    """API endpoint for user logout."""
    if request.method == 'POST':
        try:
            # Wyczyść ciasteczka z tokenami
            response = JsonResponse({
                'success': True,
                'message': 'Logout successful'
            })
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            logger.info(f"User {request.user} logged out successfully")
            return response
        except Exception as e:
            logger.error(f"Unexpected error during logout: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Server error'}, status=500)
    logger.warning("Invalid HTTP method in api_logout")
    return JsonResponse({'success': False, 'message': 'Invalid method'}, status=405)