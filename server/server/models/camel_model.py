from pydantic import BaseModel
from pydantic.generics import GenericModel


def to_camel(string: str) -> str:
    [head, *tail] = string.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    class Config:
        alias_generator = to_camel
        allow_population_by_field_name = True


class GenericCamelModel(GenericModel):
    class Config:
        alias_generator = to_camel
        allow_population_by_field_name = True
