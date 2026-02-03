import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


class ScraperService:
    def __init__(self, ai_extraction_service=None):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        self.ai_extraction_service = ai_extraction_service
    
    def scrape_training_url(self, url: str) -> Dict[str, Any]:
        """
        Extract training program details from Syntra Bizz URL
        Uses AI extraction for better accuracy with CSS selector fallback
        """
        try:
            parsed = urlparse(url)
            if not parsed.scheme:
                url = 'https://' + url
            
            logger.info(f"[SCRAPER] Fetching URL: {url}")
            
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            logger.info(f"[SCRAPER] Response status: {response.status_code}")
            logger.info(f"[SCRAPER] Content length: {len(response.content)} bytes")
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            logger.info(f"[SCRAPER] Page title: {soup.title.string if soup.title else 'No title'}")
            
            ai_data = {}
            if self.ai_extraction_service:
                try:
                    logger.info("[SCRAPER] Attempting AI extraction...")
                    html_text = soup.get_text(separator='\n', strip=True)
                    ai_data = self.ai_extraction_service.extract_training_data(html_text, source_type="url")
                    logger.info(f"[SCRAPER] AI extraction successful: {list(ai_data.keys())}")
                except Exception as e:
                    logger.warning(f"[SCRAPER] AI extraction failed, using CSS fallback: {str(e)}")
            
            css_data = {
                'title': self._extract_title(soup),
                'duration': self._extract_duration(soup),
                'target_audience': self._extract_target_audience(soup),
                'learning_objectives': self._extract_learning_objectives(soup),
                'program_outline': self._extract_program_outline(soup),
                'price': self._extract_price(soup),
                'trainer_info': self._extract_trainer_info(soup)
            }
            
            training_data = {
                'url': url,
                'title': ai_data.get('title') or css_data['title'],
                'duration': ai_data.get('duration') or css_data['duration'],
                'target_audience': ai_data.get('target_audience') or css_data['target_audience'],
                'learning_objectives': ai_data.get('learning_objectives') or css_data['learning_objectives'],
                'program_outline': ai_data.get('program_outline') or css_data['program_outline'],
                'price': ai_data.get('price') or css_data['price'],
                'trainer_info': ai_data.get('trainer_info') or css_data['trainer_info']
            }
            
            logger.info(f"[SCRAPER] Final extracted data: {training_data}")
            
            return training_data
            
        except requests.RequestException as e:
            logger.error(f"[SCRAPER] Request error: {str(e)}")
            raise Exception(f"Failed to fetch training URL: {str(e)}")
        except Exception as e:
            logger.error(f"[SCRAPER] Error scraping: {str(e)}")
            raise Exception(f"Failed to scrape training data: {str(e)}")
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract training title"""
        # Try multiple selectors specific to Syntra Bizz
        selectors = [
            'h1.entry-title',  # WordPress standard
            'h1.course-title',
            'h1.training-title',
            '.page-title h1',
            'article h1',
            'h1',
            'title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get_text(strip=True)
                logger.info(f"[SCRAPER] Found title with selector '{selector}': {title[:100]}")
                # Filter out generic titles
                if title and title.lower() not in ['home', 'syntra', 'opleidingen']:
                    return title
        
        logger.warning("[SCRAPER] No specific title found")
        return "Training titel niet gevonden"
    
    def _extract_duration(self, soup: BeautifulSoup) -> str:
        """Extract training duration"""
        # Look for duration indicators with broader search
        keywords = ['duur', 'duration', 'uren', 'hours', 'dagen', 'days', 'lesuren', 'studiepunten']
        
        for keyword in keywords:
            # Search in all text
            elements = soup.find_all(text=lambda t: t and keyword.lower() in t.lower())
            if elements:
                for elem in elements:
                    parent = elem.parent
                    if parent:
                        text = parent.get_text(strip=True)
                        # Check if it contains numbers
                        if any(char.isdigit() for char in text):
                            logger.info(f"[SCRAPER] Found duration with keyword '{keyword}': {text}")
                            return text
        
        # Try to find in structured data (schema.org)
        schema_duration = soup.find('meta', property='duration')
        if schema_duration:
            return schema_duration.get('content', '')
        
        logger.warning("[SCRAPER] No duration found")
        return None
    
    def _extract_target_audience(self, soup: BeautifulSoup) -> str:
        """Extract target audience information"""
        keywords = ['doelgroep', 'target', 'voor wie', 'audience', 'deelnemers']
        
        for keyword in keywords:
            # Find headings containing the keyword
            headings = soup.find_all(['h2', 'h3', 'h4', 'strong', 'b'], 
                                    text=lambda t: t and keyword.lower() in t.lower())
            
            for heading in headings:
                # Get the content after the heading
                content = []
                next_elem = heading.find_next_sibling()
                
                while next_elem and next_elem.name not in ['h1', 'h2', 'h3', 'h4']:
                    if next_elem.name in ['p', 'ul', 'ol', 'div']:
                        content.append(next_elem.get_text(strip=True))
                    next_elem = next_elem.find_next_sibling()
                
                if content:
                    result = '\n'.join(content)
                    logger.info(f"[SCRAPER] Found target audience with keyword '{keyword}': {result[:100]}")
                    return result
        
        logger.warning("[SCRAPER] No target audience found")
        return None
    
    def _extract_learning_objectives(self, soup: BeautifulSoup) -> str:
        """Extract learning objectives"""
        keywords = ['leerdoelen', 'doelstellingen', 'objectives', 'wat leer je', 'je leert', 'competenties']
        
        for keyword in keywords:
            # Find headings
            headings = soup.find_all(['h2', 'h3', 'h4', 'strong'], 
                                    text=lambda t: t and keyword.lower() in t.lower())
            
            for heading in headings:
                # Look for lists or content
                next_list = heading.find_next(['ul', 'ol'])
                if next_list:
                    items = [li.get_text(strip=True) for li in next_list.find_all('li')]
                    result = '\n'.join(items)
                    logger.info(f"[SCRAPER] Found learning objectives (list) with '{keyword}': {result[:100]}")
                    return result
                
                # Or get paragraph content
                next_p = heading.find_next('p')
                if next_p:
                    result = next_p.get_text(strip=True)
                    logger.info(f"[SCRAPER] Found learning objectives (paragraph) with '{keyword}': {result[:100]}")
                    return result
        
        logger.warning("[SCRAPER] No learning objectives found")
        return None
    
    def _extract_program_outline(self, soup: BeautifulSoup) -> str:
        """Extract program outline/curriculum"""
        keywords = ['programma', 'inhoud', 'curriculum', 'outline', 'modules', 'lesinhoud', 'wat behandelen we']
        
        for keyword in keywords:
            headings = soup.find_all(['h2', 'h3', 'h4', 'strong'], 
                                    text=lambda t: t and keyword.lower() in t.lower())
            
            for heading in headings:
                content = []
                next_elem = heading.find_next_sibling()
                
                # Collect content until next major heading
                while next_elem and next_elem.name not in ['h1', 'h2']:
                    if next_elem.name in ['ul', 'ol']:
                        items = [li.get_text(strip=True) for li in next_elem.find_all('li')]
                        content.extend(items)
                    elif next_elem.name in ['p', 'div']:
                        text = next_elem.get_text(strip=True)
                        if text:
                            content.append(text)
                    next_elem = next_elem.find_next_sibling()
                
                if content:
                    result = '\n'.join(content)
                    logger.info(f"[SCRAPER] Found program outline with '{keyword}': {result[:100]}")
                    return result
        
        logger.warning("[SCRAPER] No program outline found")
        return None
    
    def _extract_price(self, soup: BeautifulSoup) -> str:
        """Extract price information"""
        # Look for price patterns
        price_patterns = ['€', 'EUR', 'prijs', 'price', 'kosten', 'investering']
        
        for pattern in price_patterns:
            elements = soup.find_all(text=lambda t: t and pattern in str(t))
            if elements:
                for elem in elements:
                    text = elem.strip()
                    # Look for actual price (contains € and numbers)
                    if ('€' in text or 'EUR' in text) and any(char.isdigit() for char in text):
                        logger.info(f"[SCRAPER] Found price: {text}")
                        return text
        
        # Check for schema.org price
        schema_price = soup.find('meta', property='price')
        if schema_price:
            return schema_price.get('content', '')
        
        logger.warning("[SCRAPER] No price found")
        return None
    
    def _extract_trainer_info(self, soup: BeautifulSoup) -> str:
        """Extract trainer information"""
        keywords = ['trainer', 'docent', 'instructeur', 'begeleider', 'lesgevers']
        
        for keyword in keywords:
            headings = soup.find_all(['h2', 'h3', 'h4', 'strong'], 
                                    text=lambda t: t and keyword.lower() in t.lower())
            
            for heading in headings:
                next_elem = heading.find_next(['p', 'div', 'ul'])
                if next_elem:
                    result = next_elem.get_text(strip=True)
                    logger.info(f"[SCRAPER] Found trainer info with '{keyword}': {result[:100]}")
                    return result
        
        logger.warning("[SCRAPER] No trainer info found")
        return None
