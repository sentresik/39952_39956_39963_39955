# app/serializers.py
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'created_at', 'user', 'completed']  # Dodano 'completed'
        read_only_fields = ['user', 'created_at']

    def update(self, instance, validated_data):
        # Zachowaj oryginalnego uzytkownika, nawet jesli nie jest podany
        validated_data['user'] = instance.user
        return super().update(instance, validated_data)