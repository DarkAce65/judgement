from humps import camelize
from pydantic import BaseModel
from pydantic.generics import GenericModel


class CamelModel(BaseModel):
    class Config:
        alias_generator = camelize
        allow_population_by_field_name = True


class GenericCamelModel(GenericModel):
    class Config:
        alias_generator = camelize
        allow_population_by_field_name = True
