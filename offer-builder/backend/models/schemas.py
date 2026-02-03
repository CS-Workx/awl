from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CRMData(BaseModel):
    onderwerp: Optional[str] = Field(None, description="Subject")
    potentiele_klant: Optional[str] = Field(None, description="Client name")
    type: Optional[str] = Field(None, description="Type/Instructor")
    primaire_contact: Optional[str] = Field(None, description="Primary contact")
    extra_contact: Optional[str] = Field(None, description="Extra contact")
    beschrijving: Optional[str] = Field(None, description="Description/notes")
    commerciele_container: Optional[str] = Field(None, description="Training code")
    sales_stage: Optional[str] = Field(None, description="Sales stage")
    waarschijnlijkheid: Optional[str] = Field(None, description="Probability %")
    gewogen_omzet: Optional[str] = Field(None, description="Estimated revenue")
    weighted_margin: Optional[str] = Field(None, description="Weighted margin")
    sluitingsdatum: Optional[str] = Field(None, description="Closing date")
    datum_offerte: Optional[str] = Field(None, description="Offer date")
    
    project_manager_name: Optional[str] = Field(None, description="Project manager name")
    project_manager_phone: Optional[str] = Field(None, description="Project manager phone")
    project_manager_email: Optional[str] = Field(None, description="Project manager email")
    advisor_name: Optional[str] = Field(None, description="Advisor name")
    advisor_phone: Optional[str] = Field(None, description="Advisor phone")
    advisor_email: Optional[str] = Field(None, description="Advisor email")
    client_company_address: Optional[str] = Field(None, description="Client company address")
    client_vat_number: Optional[str] = Field(None, description="Client VAT number")


class TrainingData(BaseModel):
    title: Optional[str] = None
    duration: Optional[str] = None
    target_audience: Optional[str] = None
    learning_objectives: Optional[str] = None
    program_outline: Optional[str] = None
    price: Optional[str] = None
    trainer_info: Optional[str] = None
    url: Optional[str] = None


class IntakeData(BaseModel):
    number_of_participants: Optional[int] = None
    client_goals: Optional[str] = None
    specific_requirements: Optional[str] = None
    preferred_dates: Optional[str] = None
    additional_notes: Optional[str] = None


class OfferContent(BaseModel):
    introduction: str
    training_objectives: str
    program_overview: str
    practical_arrangements: str
    investment: str
    next_steps: str


class GenerateOfferRequest(BaseModel):
    crm_data: CRMData
    training_data: TrainingData
    intake_data: IntakeData


class ExtractCRMRequest(BaseModel):
    image_base64: str


class ExtractTrainingRequest(BaseModel):
    url: str


class CreateDocxRequest(BaseModel):
    offer_data: Dict[str, Any]
    crm_data: CRMData
    training_data: TrainingData
    intake_data: IntakeData


class OpenCRMRequest(BaseModel):
    crm_url: str


class NavigateTicketRequest(BaseModel):
    ticket_url: str


class OpenTrainingURLRequest(BaseModel):
    url: str

