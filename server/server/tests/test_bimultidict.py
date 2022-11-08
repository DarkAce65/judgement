from unittest import TestCase

from server.utils.bimultidict import bimultidict


class TestBiMultiDict(TestCase):
    def test_create_empty(self) -> None:
        mapping = bimultidict()

        self.assertEqual(len(mapping.keys()), 0)
        self.assertEqual(len(mapping), 0)
        self.assertEqual(len(mapping.values()), 0)

    def test_create_initialized(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")

    def test_contains(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        self.assertTrue(mapping.contains_key("key1"))
        self.assertTrue(mapping.contains_key("key2"))
        self.assertFalse(mapping.contains_key("key3"))
        self.assertFalse(mapping.contains_key("value1"))

        self.assertTrue(mapping.contains_value("value1"))
        self.assertTrue(mapping.contains_value("value2"))
        self.assertFalse(mapping.contains_value("value4"))
        self.assertFalse(mapping.contains_value("key1"))

    def test_add_items(self) -> None:
        mapping = bimultidict()

        mapping.put("key1", "value1")
        mapping.put("key1", "value2")
        mapping.put("key2", "value3")

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")

    def test_add_items_to_initialized(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.put("key3", "value4")

        self.assertEqual(len(mapping.keys()), 3)
        self.assertEqual(len(mapping), 4)
        self.assertEqual(len(mapping.values()), 4)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key3", "value4"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertSetEqual(mapping["key3"], set(["value4"]))
        self.assertSetEqual(mapping.get("key3"), set(["value4"]))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")
        self.assertEqual(mapping.get_key("value4"), "key3")

    def test_add_mapping_to_key(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.put("key2", "value4")

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 4)
        self.assertEqual(len(mapping.values()), 4)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key2", "value4"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3", "value4"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3", "value4"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")
        self.assertEqual(mapping.get_key("value4"), "key2")

    def test_add_mapping_to_key_replacing_existing_mapping(self) -> None:
        mapping = bimultidict(
            [
                ("key1", "value1"),
                ("key1", "value2"),
                ("key2", "value3"),
                ("key2", "value4"),
            ]
        )

        mapping.put("key3", "value4")

        self.assertEqual(len(mapping.keys()), 3)
        self.assertEqual(len(mapping), 4)
        self.assertEqual(len(mapping.values()), 4)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key3", "value4"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertSetEqual(mapping["key3"], set(["value4"]))
        self.assertSetEqual(mapping.get("key3"), set(["value4"]))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")
        self.assertEqual(mapping.get_key("value4"), "key3")

    def test_add_mapping_to_key_replacing_and_dropping_existing_mapping(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.put("key3", "value3")

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertNotIn("key2", mapping)
        self.assertIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertFalse(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key3", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertIsNone(mapping.get("key2"))
        self.assertSetEqual(mapping["key3"], set(["value3"]))
        self.assertSetEqual(mapping.get("key3"), set(["value3"]))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key3")

    def test_remove_items(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        self.assertEqual(mapping.remove_value("value1"), "key1")

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 2)
        self.assertEqual(len(mapping.values()), 2)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")

        self.assertEqual(mapping.remove_value("value3"), "key2")

        self.assertEqual(len(mapping.keys()), 1)
        self.assertEqual(len(mapping), 1)
        self.assertEqual(len(mapping.values()), 1)

        self.assertIn("key1", mapping)
        self.assertNotIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertFalse(mapping.contains_pair("key2", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value2"]))
        self.assertIsNone(mapping.get("key2"))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertIsNone(mapping.get_key("value3"))

    def test_remove_all_items(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        self.assertSetEqual(
            mapping.remove_all_values_for_key("key1"), set(["value1", "value2"])
        )

        self.assertEqual(len(mapping.keys()), 1)
        self.assertEqual(len(mapping), 1)
        self.assertEqual(len(mapping.values()), 1)

        self.assertNotIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertFalse(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertIsNone(mapping.get("key1"))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertIsNone(mapping.get_key("value2"))
        self.assertEqual(mapping.get_key("value3"), "key2")

        self.assertSetEqual(mapping.remove_all_values_for_key("key2"), set(["value3"]))

        self.assertEqual(len(mapping.keys()), 0)
        self.assertEqual(len(mapping), 0)
        self.assertEqual(len(mapping.values()), 0)

        self.assertNotIn("key1", mapping)
        self.assertNotIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertFalse(mapping.contains_pair("key1", "value2"))
        self.assertFalse(mapping.contains_pair("key2", "value3"))

        self.assertIsNone(mapping.get("key1"))
        self.assertIsNone(mapping.get("key2"))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertIsNone(mapping.get_key("value2"))
        self.assertIsNone(mapping.get_key("value3"))

    def test_del_keys(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        del mapping["key1"]

        self.assertEqual(len(mapping.keys()), 1)
        self.assertEqual(len(mapping), 1)
        self.assertEqual(len(mapping.values()), 1)

        self.assertNotIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertFalse(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertIsNone(mapping.get("key1"))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertIsNone(mapping.get_key("value2"))
        self.assertEqual(mapping.get_key("value3"), "key2")

        del mapping["key2"]

        self.assertEqual(len(mapping.keys()), 0)
        self.assertEqual(len(mapping), 0)
        self.assertEqual(len(mapping.values()), 0)

        self.assertNotIn("key1", mapping)
        self.assertNotIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertFalse(mapping.contains_pair("key1", "value2"))
        self.assertFalse(mapping.contains_pair("key2", "value3"))

        self.assertIsNone(mapping.get("key1"))
        self.assertIsNone(mapping.get("key2"))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertIsNone(mapping.get_key("value2"))
        self.assertIsNone(mapping.get_key("value3"))

    def test_set_items(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.set_values("key3", set(["value4", "value5"]))

        self.assertEqual(len(mapping.keys()), 3)
        self.assertEqual(len(mapping), 5)
        self.assertEqual(len(mapping.values()), 5)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key3", "value4"))
        self.assertTrue(mapping.contains_pair("key3", "value5"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertSetEqual(mapping["key3"], set(["value4", "value5"]))
        self.assertSetEqual(mapping.get("key3"), set(["value4", "value5"]))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")
        self.assertEqual(mapping.get_key("value4"), "key3")
        self.assertEqual(mapping.get_key("value5"), "key3")

    def test_set_items_replacing_existing_key(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.set_values("key1", set(["value4", "value5"]))

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertFalse(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key1", "value4"))
        self.assertTrue(mapping.contains_pair("key1", "value5"))

        self.assertSetEqual(mapping["key1"], set(["value4", "value5"]))
        self.assertSetEqual(mapping.get("key1"), set(["value4", "value5"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertIsNone(mapping.get_key("value2"))
        self.assertEqual(mapping.get_key("value3"), "key2")
        self.assertEqual(mapping.get_key("value4"), "key1")
        self.assertEqual(mapping.get_key("value5"), "key1")

    def test_set_items_replacing_existing_mapping(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        mapping.set_values("key1", set(["value2", "value3", "value4"]))

        self.assertEqual(len(mapping.keys()), 1)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertNotIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertFalse(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertFalse(mapping.contains_pair("key2", "value3"))
        self.assertTrue(mapping.contains_pair("key1", "value3"))
        self.assertTrue(mapping.contains_pair("key1", "value4"))

        self.assertSetEqual(mapping["key1"], set(["value2", "value3", "value4"]))
        self.assertSetEqual(mapping.get("key1"), set(["value2", "value3", "value4"]))
        self.assertIsNone(mapping.get("key2"))
        self.assertIsNone(mapping.get("key3"))

        self.assertIsNone(mapping.get_key("value1"))
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key1")
        self.assertEqual(mapping.get_key("value4"), "key1")

    def test_removing_non_existent_mappings(self) -> None:
        mapping = bimultidict(
            [("key1", "value1"), ("key1", "value2"), ("key2", "value3")]
        )

        self.assertRaisesRegex(
            KeyError, "does not exist in this mapping", mapping.remove_value, "value4"
        )

        with self.assertRaisesRegex(KeyError, "does not exist in this mapping"):
            del mapping["key3"]

        self.assertRaisesRegex(
            KeyError,
            "does not exist in this mapping",
            mapping.remove_all_values_for_key,
            "key3",
        )

        self.assertEqual(len(mapping.keys()), 2)
        self.assertEqual(len(mapping), 3)
        self.assertEqual(len(mapping.values()), 3)

        self.assertIn("key1", mapping)
        self.assertIn("key2", mapping)
        self.assertNotIn("key3", mapping)

        self.assertTrue(mapping.contains_pair("key1", "value1"))
        self.assertTrue(mapping.contains_pair("key1", "value2"))
        self.assertTrue(mapping.contains_pair("key2", "value3"))

        self.assertSetEqual(mapping["key1"], set(["value1", "value2"]))
        self.assertSetEqual(mapping.get("key1"), set(["value1", "value2"]))
        self.assertSetEqual(mapping["key2"], set(["value3"]))
        self.assertSetEqual(mapping.get("key2"), set(["value3"]))
        self.assertIsNone(mapping.get("key3"))

        self.assertEqual(mapping.get_key("value1"), "key1")
        self.assertEqual(mapping.get_key("value2"), "key1")
        self.assertEqual(mapping.get_key("value3"), "key2")
