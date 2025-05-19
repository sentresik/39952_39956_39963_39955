from django.urls import path, include
from django.contrib.auth.views import LoginView, LogoutView
from rest_framework.routers import DefaultRouter
from . import views
from . import forms
from datetime import datetime

router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('login/',
         LoginView.as_view(
             template_name='app/start.html',
             authentication_form=forms.BootstrapAuthenticationForm,
             extra_context=dict(title='Log in', year=datetime.now().year)
         ),
         name='login'),
    path('logout/', LogoutView.as_view(next_page='/start/'), name='logout'),
    path('start/', views.start_view, name='start'),
    path('register/', views.register_view, name='register'),
    path('edit/', views.edit_requests_view, name='edit_requests'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/', include(router.urls)),
]