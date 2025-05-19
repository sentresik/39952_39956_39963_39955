from datetime import datetime
from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import json

from .models import Task
from .serializers import TaskSerializer

# Widoki dla stron HTML
def home(request):
    """Renders the home page (index.html - lista zadań)."""
    assert isinstance(request, HttpRequest)
    if not request.user.is_authenticated:
        return redirect('start')
    return render(
        request,
        'app/index.html',
        {
            'title': 'ToDo List',
            'year': datetime.now().year,
        }
    )


def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/about.html',
        {
            'title': 'About',
            'message': 'Your application description page.',
            'year': datetime.now().year,
        }
    )

def start_view(request):
    """Renders the start page (welcome page)."""
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'app/start.html', {'title': 'Welcome to ToDo'})

def register_view(request):
    """Renders the register page."""
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'app/register.html', {'title': 'Register - ToDo'})

def edit_requests_view(request):
    """Renders the edit requests page."""
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'app/edit_requests.html', {'title': 'Edit ToDo Tasks'})

# Endpointy API
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
                return JsonResponse({'success': False, 'message': 'All fields are required'}, status=400)

            if password != confirm_password:
                return JsonResponse({'success': False, 'message': 'Passwords do not match'}, status=400)

            if (
                len(password) < 6 or
                len(password) > 20 or
                not any(c.islower() for c in password) or
                not any(c.isupper() for c in password) or
                not any(c.isdigit() for c in password)
            ):
                return JsonResponse({'success': False, 'message': 'Password must be 6 to 20 characters long and include a lowercase letter, an uppercase letter, and a number.'}, status=400)

            if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already exists'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password)
            user.save()
            login(request, user)
            return JsonResponse({'success': True})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
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
                return JsonResponse({'success': False, 'message': 'Email and password are required'}, status=400)

            # Uwierzytelnianie użytkownika
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'success': True, 'message': 'Login successful'})
            else:
                return JsonResponse({'success': False, 'message': 'Invalid email or password'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'success': False, 'message': 'Invalid method'}, status=405)

# API dla zadań
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()  # Dodajemy statyczny queryset
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)