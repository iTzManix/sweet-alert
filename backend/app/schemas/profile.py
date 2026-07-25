from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileIn(BaseModel):
    sex: Literal["M", "F"] = Field(description="Sexo biológico, tal como lo esperan los modelos entrenados")
    birth_date: date = Field(description="Se usa para derivar la edad en cada evaluación")
    height_cm: float = Field(ge=100, le=250, description="Estatura en centímetros, para calcular el IMC")
    education_level: int = Field(ge=1, le=6, description="Categoría de nivel educativo BRFSS (1=nunca asistió, 6=posgrado)")
    income_level: int = Field(ge=1, le=8, description="Categoría de nivel de ingresos BRFSS (1=más bajo, 8=más alto)")
    occupation: Optional[str] = Field(default=None, description="Ocupación en texto libre, ej. 'Nurse', 'Engineer'")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sex": "F",
                "birth_date": "1990-05-20",
                "height_cm": 165,
                "education_level": 4,
                "income_level": 5,
                "occupation": "Nurse",
            }
        }
    )


class ProfileOut(ProfileIn):
    id: str = Field(description="Igual al user id de Supabase Auth")
