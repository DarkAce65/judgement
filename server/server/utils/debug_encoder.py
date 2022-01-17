import inspect
import json
from typing import Any

from server.models.camel_model import CamelModel


class DebugEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if callable(o):
            return o.__name__
        elif issubclass(type(o), CamelModel):
            return o.dict()
        try:
            iterable = iter(o)
            return list(iterable)
        except TypeError:
            pass

        fns = {
            fn_name
            for (fn_name, _) in inspect.getmembers(type(o), predicate=inspect.isfunction)
        }
        if "__str__" in fns or "__repr__" in fns:
            return str(o)

        return vars(o)


def dump_class(obj: Any) -> dict[str, Any]:
    return json.loads(json.dumps(vars(obj), cls=DebugEncoder))
