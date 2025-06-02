"""
Definition of urls for ToDo.
"""

from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),  # Podłączamy trasy z app/urls.py
]