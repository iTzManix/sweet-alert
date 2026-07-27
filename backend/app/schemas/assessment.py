from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

_EXAMPLE = {
    "weight_kg": 70,
    "high_bp": True,
    "high_chol": True,
    "chol_check": True,
    "smoker": False,
    "stroke": False,
    "heart_disease": False,
    "phys_activity": True,
    "fruits": True,
    "veggies": True,
    "hvy_alcohol": False,
    "any_healthcare": True,
    "no_doc_cost": False,
    "gen_health": 3,
    "ment_health_days": 2,
    "phys_health_days": 1,
    "diff_walk": False,
    "polyuria": False,
    "polydipsia": True,
    "sudden_weight_loss": False,
    "weakness": True,
    "polyphagia": False,
    "genital_thrush": False,
    "visual_blurring": False,
    "itching": False,
    "irritability": False,
    "delayed_healing": False,
    "partial_paresis": False,
    "muscle_stiffness": False,
    "alopecia": False,
    "obesity": False,
    "sleep_duration_hours": 6.5,
    "sleep_quality": 6,
    "physical_activity_level": 40,
    "stress_level": 7,
    "daily_steps": 6000,
    "heart_rate": 78,
    "daily_calories": 2100,
    "sugar_g": 45,
    "carbs_g": 250,
    "protein_g": 70,
    "fat_g": 60,
    "fiber_g": 20,
    "water_l": 1.8,
    "fruit_servings": 2,
    "veggie_servings": 3,
}


class AssessmentIn(BaseModel):
    """Un check-in completo: los 3 formularios de riesgo/síntomas/estilo de vida + nutrición del día."""

    # --- Modelo 1: riesgo de diabetes (CDC/BRFSS) ---
    weight_kg: float = Field(ge=20, le=300, description="Peso actual en kg, junto a la estatura del perfil calcula el IMC")
    high_bp: bool = Field(description="¿Tiene presión arterial alta?")
    high_chol: bool = Field(description="¿Tiene colesterol alto?")
    chol_check: bool = Field(description="¿Se hizo un control de colesterol en los últimos 5 años?")
    smoker: bool = Field(description="¿Ha fumado al menos 100 cigarrillos en su vida?")
    stroke: bool = Field(description="¿Ha sufrido un accidente cerebrovascular?")
    heart_disease: bool = Field(description="¿Tiene enfermedad cardíaca o sufrió un infarto?")
    phys_activity: bool = Field(description="¿Hizo actividad física en el último mes (fuera del trabajo)?")
    fruits: bool = Field(description="¿Consume fruta diariamente?")
    veggies: bool = Field(description="¿Consume verduras diariamente?")
    hvy_alcohol: bool = Field(description="¿Consume alcohol en exceso?")
    any_healthcare: bool = Field(description="¿Tiene algún tipo de cobertura de salud?")
    no_doc_cost: bool = Field(description="¿Alguna vez no fue al médico por el costo?")
    gen_health: int = Field(ge=1, le=5, description="Estado general de salud autopercibido (1=excelente, 5=malo)")
    ment_health_days: int = Field(ge=0, le=30, description="Días con mala salud mental en el último mes")
    phys_health_days: int = Field(ge=0, le=30, description="Días con mala salud física en el último mes")
    diff_walk: bool = Field(description="¿Tiene dificultad seria para caminar o subir escaleras?")

    # --- Modelo 3: síntomas tempranos ---
    polyuria: bool = Field(description="¿Orina con frecuencia inusual?")
    polydipsia: bool = Field(description="¿Sed excesiva?")
    sudden_weight_loss: bool = Field(description="¿Pérdida de peso repentina?")
    weakness: bool = Field(description="¿Debilidad general?")
    polyphagia: bool = Field(description="¿Hambre excesiva?")
    genital_thrush: bool = Field(description="¿Infecciones genitales frecuentes?")
    visual_blurring: bool = Field(description="¿Visión borrosa?")
    itching: bool = Field(description="¿Picazón frecuente?")
    irritability: bool = Field(description="¿Irritabilidad?")
    delayed_healing: bool = Field(description="¿Cicatrización lenta de heridas?")
    partial_paresis: bool = Field(description="¿Debilidad muscular parcial?")
    muscle_stiffness: bool = Field(description="¿Rigidez muscular?")
    alopecia: bool = Field(description="¿Pérdida de cabello inusual?")
    obesity: bool = Field(description="¿Obesidad?")

    # --- Modelo 2: estilo de vida ---
    sleep_duration_hours: float = Field(ge=0, le=24, description="Horas de sueño promedio por noche")
    sleep_quality: int = Field(ge=1, le=10, description="Calidad de sueño autopercibida (1=muy mala, 10=excelente)")
    physical_activity_level: int = Field(ge=0, le=100, description="Nivel de actividad física, 0-100")
    stress_level: int = Field(ge=1, le=10, description="Nivel de estrés percibido (1=muy bajo, 10=muy alto)")
    daily_steps: int = Field(ge=0, le=50000, description="Pasos diarios promedio")
    heart_rate: int = Field(ge=40, le=200, description="Frecuencia cardíaca en reposo (lpm)")

    # --- Modelo 4: nutrición (score por fórmula, sin ML) ---
    daily_calories: float = Field(ge=500, le=6000, description="Calorías consumidas en el día")
    sugar_g: float = Field(ge=0, description="Azúcar consumida en el día, en gramos")
    carbs_g: float = Field(ge=0, description="Carbohidratos consumidos en el día, en gramos")
    protein_g: float = Field(ge=0, description="Proteína consumida en el día, en gramos")
    fat_g: float = Field(ge=0, description="Grasa consumida en el día, en gramos")
    fiber_g: float = Field(ge=0, description="Fibra consumida en el día, en gramos")
    water_l: float = Field(ge=0, le=10, description="Agua consumida en el día, en litros")
    fruit_servings: int = Field(ge=0, le=20, description="Porciones de fruta en el día")
    veggie_servings: int = Field(ge=0, le=20, description="Porciones de verdura en el día")

    model_config = ConfigDict(json_schema_extra={"example": _EXAMPLE})


class AssessmentOut(AssessmentIn):
    id: str
    created_at: str
    risk_probability: float = Field(description="Probabilidad de riesgo de diabetes, 0-1 (Modelo 1)")
    risk_level: str = Field(description="'bajo' (<0.30), 'moderado' (0.30-0.60) o 'alto' (>=0.60)")
    symptoms_probability: float = Field(description="Probabilidad de síntomas compatibles, 0-1 (Modelo 3)")
    symptoms_level: str = Field(description="'bajo', 'moderado' o 'alto', mismos cortes que risk_level")
    sleep_disorder_probability: Optional[float] = Field(description="Probabilidad de un trastorno de sueño real (Modelo 2, señal secundaria)")
    lifestyle_category: str = Field(description="'excelente' | 'bueno' | 'regular' | 'malo', calculado por fórmula")
    nutrition_score: int = Field(description="Puntaje 0-5 calculado por fórmula sobre la nutrición del día")
    nutrition_category: str = Field(description="'excelente' | 'buena' | 'regular' | 'deficiente'")
    llm_recommendation: dict = Field(description="resumen, factor_principal y recomendaciones generadas por el LLM")
