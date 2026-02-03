from playwright.async_api import async_playwright, Page, Browser
from typing import Dict, Any, Optional
import asyncio
import base64
from pathlib import Path


class BrowserService:
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright = None
        
    async def initialize(self):
        """Initialize Playwright browser"""
        if not self.playwright:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=False,  # Show browser so user can login
                args=['--start-maximized']
            )
    
    async def close(self):
        """Close browser and cleanup"""
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        
        self.page = None
        self.browser = None
        self.playwright = None
    
    async def open_crm_login(self, crm_url: str) -> str:
        """
        Open CRM login page and return session ID for further interaction
        """
        try:
            await self.initialize()
            
            # Create new page
            self.page = await self.browser.new_page()
            
            # Navigate to CRM
            await self.page.goto(crm_url, wait_until='networkidle')
            
            # Return a session identifier
            return "browser_session_active"
            
        except Exception as e:
            await self.close()
            raise Exception(f"Failed to open CRM: {str(e)}")
    
    async def wait_for_user_login(self, timeout: int = 300000) -> bool:
        """
        Wait for user to complete login
        Monitor for successful navigation or specific elements
        """
        try:
            if not self.page:
                raise Exception("No active browser page")
            
            # Wait for navigation after login (adjust based on CRM behavior)
            # This is a simple approach - can be customized per CRM
            await self.page.wait_for_load_state('networkidle', timeout=timeout)
            
            return True
            
        except Exception as e:
            raise Exception(f"Login timeout or failed: {str(e)}")
    
    async def navigate_to_ticket(self, ticket_url: str) -> bool:
        """
        Navigate to specific CRM ticket/opportunity
        """
        try:
            if not self.page:
                raise Exception("No active browser page")
            
            await self.page.goto(ticket_url, wait_until='networkidle')
            
            # Wait a bit for dynamic content to load
            await self.page.wait_for_timeout(2000)
            
            return True
            
        except Exception as e:
            raise Exception(f"Failed to navigate to ticket: {str(e)}")
    
    async def capture_screenshot(self) -> str:
        """
        Capture screenshot of current page and return as base64
        """
        try:
            if not self.page:
                raise Exception("No active browser page")
            
            # Take screenshot
            screenshot_bytes = await self.page.screenshot(full_page=True)
            
            # Convert to base64
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            return f"data:image/png;base64,{screenshot_base64}"
            
        except Exception as e:
            raise Exception(f"Failed to capture screenshot: {str(e)}")
    
    async def extract_page_data(self) -> Dict[str, Any]:
        """
        Extract visible text and structured data from current page
        Alternative to screenshot for data extraction
        """
        try:
            if not self.page:
                raise Exception("No active browser page")
            
            # Get page content
            content = await self.page.content()
            
            # Extract text content
            text_content = await self.page.evaluate("""
                () => {
                    return document.body.innerText;
                }
            """)
            
            # Try to extract structured data (can be customized per CRM)
            structured_data = await self.page.evaluate("""
                () => {
                    const data = {};
                    
                    // Look for common label-value pairs
                    const labels = document.querySelectorAll('label, .label, .field-label');
                    labels.forEach(label => {
                        const text = label.textContent.trim();
                        const nextElement = label.nextElementSibling;
                        if (nextElement) {
                            data[text] = nextElement.textContent.trim();
                        }
                    });
                    
                    return data;
                }
            """)
            
            return {
                "text_content": text_content,
                "structured_data": structured_data
            }
            
        except Exception as e:
            raise Exception(f"Failed to extract page data: {str(e)}")
    
    async def get_current_url(self) -> str:
        """Get current page URL"""
        if not self.page:
            raise Exception("No active browser page")
        return self.page.url
    
    async def is_active(self) -> bool:
        """Check if browser session is active"""
        return self.page is not None and not self.page.is_closed()
    
    async def open_training_url(self, url: str) -> str:
        """
        Open training URL in browser for screenshot capture
        """
        try:
            await self.initialize()
            
            self.page = await self.browser.new_page()
            
            await self.page.goto(url, wait_until='networkidle', timeout=30000)
            
            await self.page.wait_for_timeout(3000)
            
            return "training_browser_session_active"
            
        except Exception as e:
            await self.close()
            raise Exception(f"Failed to open training URL: {str(e)}")
    
    async def capture_full_page_screenshot(self) -> str:
        """
        Capture full-page screenshot and return as base64
        Reuses existing capture_screenshot logic
        """
        return await self.capture_screenshot()
    
    async def close_training_browser(self) -> None:
        """
        Close training browser session
        Reuses existing close method
        """
        await self.close()


# Global browser instance (singleton pattern for session management)
browser_service = BrowserService()
