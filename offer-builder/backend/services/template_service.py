import os
import uuid
from typing import List, Dict, Optional
from fastapi import UploadFile
import shutil


class TemplateService:
    def __init__(self, templates_base_dir: str = "./templates"):
        self.templates_base_dir = templates_base_dir
        self.user_uploads_dir = os.path.join(templates_base_dir, "user_uploads")
        
        # Ensure directories exist
        os.makedirs(self.templates_base_dir, exist_ok=True)
        os.makedirs(self.user_uploads_dir, exist_ok=True)
    
    async def upload_template(self, file: UploadFile, user_id: str = "default") -> Dict[str, str]:
        """
        Upload and save a DOCX template file
        
        Args:
            file: Uploaded DOCX file
            user_id: User identifier (default for MVP)
        
        Returns:
            Dict with template_id, filename, and path
        """
        # Validate file type
        if not file.filename.endswith('.docx'):
            raise ValueError("Only DOCX files are allowed")
        
        # Validate file size (5MB max)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to start
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise ValueError("File size exceeds 5MB limit")
        
        # Generate unique template ID
        template_id = str(uuid.uuid4())
        
        # Create filename: {uuid}_{original_name}
        safe_filename = f"{template_id}_{file.filename}"
        filepath = os.path.join(self.user_uploads_dir, safe_filename)
        
        # Save file
        try:
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise Exception(f"Failed to save template: {str(e)}")
        
        return {
            "template_id": template_id,
            "filename": file.filename,
            "path": filepath
        }
    
    def get_template_path(self, template_id: str) -> str:
        """
        Get the file path for a template by ID
        
        Args:
            template_id: Template identifier
        
        Returns:
            Full path to template file
        """
        # Special case: "default" uses the main template
        if template_id == "default":
            default_path = os.path.join(self.templates_base_dir, "default.docx")
            if os.path.exists(default_path):
                return default_path
            # Fallback to environment variable path
            return None
        
        # Search for template in user_uploads
        for filename in os.listdir(self.user_uploads_dir):
            if filename.startswith(template_id):
                return os.path.join(self.user_uploads_dir, filename)
        
        raise FileNotFoundError(f"Template {template_id} not found")
    
    def list_templates(self, user_id: str = "default") -> List[Dict[str, str]]:
        """
        List all available templates for a user
        
        Args:
            user_id: User identifier
        
        Returns:
            List of template info dictionaries
        """
        templates = []
        
        # Add default template if it exists
        default_path = os.path.join(self.templates_base_dir, "default.docx")
        if os.path.exists(default_path):
            templates.append({
                "id": "default",
                "name": "Standaard Syntra Bizz Template",
                "path": default_path
            })
        
        # Add user uploaded templates
        if os.path.exists(self.user_uploads_dir):
            for filename in os.listdir(self.user_uploads_dir):
                if filename.endswith('.docx'):
                    # Extract template_id and original name
                    parts = filename.split('_', 1)
                    if len(parts) == 2:
                        template_id = parts[0]
                        original_name = parts[1]
                        templates.append({
                            "id": template_id,
                            "name": original_name,
                            "path": os.path.join(self.user_uploads_dir, filename)
                        })
        
        return templates
    
    def delete_template(self, template_id: str) -> bool:
        """
        Delete a template file
        
        Args:
            template_id: Template identifier
        
        Returns:
            True if deleted, False if not found
        """
        # Don't allow deleting default template
        if template_id == "default":
            raise ValueError("Cannot delete default template")
        
        try:
            filepath = self.get_template_path(template_id)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except FileNotFoundError:
            return False
