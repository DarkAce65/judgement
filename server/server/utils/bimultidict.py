from collections import defaultdict
from typing import (
    AbstractSet,
    Any,
    Iterable,
    Iterator,
    KeysView,
    MutableMapping,
    Optional,
    Tuple,
    TypeVar,
    Union,
    overload,
)

KT = TypeVar("KT")
VT = TypeVar("VT")


class bimultidict(MutableMapping[KT, set[VT]]):
    _forward_mapping: defaultdict[KT, set[VT]]
    _inverse_mapping: dict[VT, KT]

    def __init__(self, mappings: Iterable[Tuple[KT, VT]] = []) -> None:
        self._forward_mapping = defaultdict(set)
        self._inverse_mapping = {}

        self.put_all(mappings)

    def __len__(self) -> int:
        return len(self._inverse_mapping)

    def __iter__(self) -> Iterator[KT]:
        return iter(self._forward_mapping)

    def __contains__(self, obj: object) -> bool:
        return self._forward_mapping.__contains__(obj)

    def __getitem__(self, key: KT) -> set[VT]:
        return self._forward_mapping[key]

    def __setitem__(self, key: KT, values: set[VT]) -> None:
        return self.set_values(key, values)

    def __delitem__(self, key: KT) -> None:
        self.remove_all_values_for_key(key)

    def __repr__(self) -> str:
        clsname = self.__class__.__name__
        if not self:
            return f"{clsname}()"

        return f"{clsname}({list(self.items())})"

    def keys(self) -> KeysView[KT]:
        return self._forward_mapping.keys()

    def values(self) -> AbstractSet[VT]:  # type: ignore  # https://github.com/python/typeshed/issues/4435
        return self._inverse_mapping.keys()

    def contains_pair(self, key: KT, value: VT) -> bool:
        return (
            key in self._forward_mapping
            and (value in self._inverse_mapping)
            and value in self._forward_mapping[key]
            and self._inverse_mapping[value] == key
        )

    @overload
    def get(self, key: KT) -> Optional[set[VT]]:
        ...

    @overload
    def get(self, key: KT, default: Any = ...) -> Union[set[VT], Any]:
        ...

    def get(self, key: KT, default: Any = None) -> Union[set[VT], Any]:
        if key in self._forward_mapping:
            return self._forward_mapping.get(key)

        return default

    def get_key(self, value: VT) -> Optional[KT]:
        return self._inverse_mapping.get(value)

    def set_values(self, key: KT, values: set[VT]) -> None:
        if key in self._forward_mapping:
            self.remove_all_values_for_key(key)

        self.put_all([(key, value) for value in values])

    def put(self, key: KT, value: VT) -> None:
        if value in self._inverse_mapping:
            old_key = self._inverse_mapping[value]
            if len(self._forward_mapping[old_key]) == 1:
                del self._forward_mapping[old_key]
            else:
                self._forward_mapping[old_key].remove(value)

        self._forward_mapping[key].add(value)
        self._inverse_mapping[value] = key

    def put_all(self, mappings: Iterable[Tuple[KT, VT]]) -> None:
        for mapping in mappings:
            key, value = mapping
            self.put(key, value)

    def remove_value(self, value: VT) -> KT:
        if value not in self._inverse_mapping:
            raise KeyError(f"{value} does not exist in this mapping")

        key = self._inverse_mapping[value]

        if len(self._forward_mapping[key]) == 1:
            del self._forward_mapping[key]
        else:
            self._forward_mapping[key].remove(value)
        del self._inverse_mapping[value]

        return key

    def remove_all_values_for_key(self, key: KT) -> set[VT]:
        if key not in self._forward_mapping:
            raise KeyError(f"{key} does not exist in this mapping")

        values = self._forward_mapping[key]

        for value in values:
            del self._inverse_mapping[value]
        del self._forward_mapping[key]

        return values
