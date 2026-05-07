from django import forms
from .models import Photo


class PhotoForm(forms.ModelForm):
    class Meta:
        model = Photo
        # We exclude views_count and created_at because the system handles those
        fields = ['title', 'description', 'thumb_url', 'full_url', 'cut_1', 'cut_2', 'cut_3', 'cut_4']

        # Adding CSS classes directly in the form for our luxury styling
        widgets = {
            'title': forms.TextInput(attrs={'class': 'admin-input', 'placeholder': 'Piece Name'}),
            'description': forms.Textarea(
                attrs={'class': 'admin-input', 'rows': 4, 'placeholder': 'Editorial description...'}),
            'thumb_url': forms.FileInput(attrs={'class': 'admin-file-input'}),
            'full_url': forms.FileInput(attrs={'class': 'admin-file-input'}),
            'cut_1': forms.FileInput(attrs={'class': 'admin-file-input'}),
            'cut_2': forms.FileInput(attrs={'class': 'admin-file-input'}),
            'cut_3': forms.FileInput(attrs={'class': 'admin-file-input'}),
            'cut_4': forms.FileInput(attrs={'class': 'admin-file-input'}),
        }