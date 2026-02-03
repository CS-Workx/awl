"""
Syntra Bizz Offer Generator

Copyright (c) 2026 Steff Vanhaverbeke for Syntra Bizz
Licensed under the MIT License
"""

from setuptools import setup, find_packages

with open("../README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="syntra-bizz-offer-generator",
    version="1.0.0",
    author="Steff Vanhaverbeke",
    author_email="steff@vanhaverbeke.com",
    description="AI-assisted training offer generation for Syntra Bizz",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/steffvanhaverbeke/offer-builder",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Office/Business",
        "Topic :: Education",
    ],
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.32.1",
        "python-docx>=1.1.2",
        "python-multipart>=0.0.18",
        "beautifulsoup4>=4.12.3",
        "requests>=2.32.3",
        "Pillow>=11.0.0",
        "google-generativeai>=0.8.3",
        "python-dotenv>=1.0.1",
        "pydantic>=2.10.3",
        "playwright>=1.49.0",
    ],
    entry_points={
        "console_scripts": [
            "syntra-offer=app:main",
        ],
    },
)
