from django.db import models

class Photo(models.Model):
    title       = models.CharField(max_length=100)
    description = models.TextField()
    thumb_url   = models.ImageField(upload_to='thumbnails/')
    views_count = models.PositiveIntegerField(default=0)

    def upload_path(self, filename):
        # Store images in media/fullsize/<title>/
        return f"fullsize/{self.title}/{filename}"

    full_url = models.ImageField(upload_to=upload_path)
    cut_1 = models.ImageField(upload_to=upload_path, blank=True, null=True)
    cut_2 = models.ImageField(upload_to=upload_path, blank=True, null=True)
    cut_3 = models.ImageField(upload_to=upload_path, blank=True, null=True)
    cut_4 = models.ImageField(upload_to=upload_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.sent_at.strftime('%Y-%m-%d %H:%M')}"