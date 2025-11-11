import React, { useEffect, useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { Button, Searchbar, TextInput } from "react-native-paper";

interface SelectOption {
    label: string;
    value: string | number;
}

interface SearchableSelectProps {
    label: string;
    value: string | number | null;
    onChange: (value: string | number) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    searchPlaceholder?: string;
}

export default function SearchableSelect({ label, value, onChange, options, placeholder = "Pilih opsi", error, disabled = false, searchPlaceholder = "Cari..." }: SearchableSelectProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(options);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredOptions(filtered);
        }
    }, [searchQuery, options]);

    const handleSelect = (selectedValue: string | number) => {
        onChange(selectedValue);
        setModalVisible(false);
        setSearchQuery("");
    };

    const handleOpenModal = () => {
        if (!disabled) {
            setModalVisible(true);
            setSearchQuery("");
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={handleOpenModal} disabled={disabled}>
                <View pointerEvents="none">
                    <TextInput label={label} value={selectedOption?.label || ""} placeholder={placeholder} error={!!error} mode="outlined" right={<TextInput.Icon icon="chevron-down" onPress={handleOpenModal} />} editable={false} />
                </View>
            </TouchableOpacity>

            {error && <Text className="text-red-600 text-sm mt-1 ml-1">{error}</Text>}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black bg-opacity-50">
                    <View className="bg-white rounded-t-lg max-h-96">
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-center">{label}</Text>
                            <View className="mt-2">
                                <Searchbar placeholder={searchPlaceholder} onChangeText={setSearchQuery} value={searchQuery} style={{ elevation: 0, backgroundColor: "#f9fafb" }} />
                            </View>
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.value.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity className={`p-4 border-b border-gray-100 ${item.value === value ? "bg-green-50" : ""}`} onPress={() => handleSelect(item.value)}>
                                    <Text className={`text-base ${item.value === value ? "text-green-600 font-semibold" : "text-gray-800"}`}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="p-4">
                                    <Text className="text-gray-500 text-center">{searchQuery.trim() !== "" ? "Tidak ada hasil pencarian" : "Tidak ada opsi tersedia"}</Text>
                                </View>
                            }
                            style={{ maxHeight: 300 }}
                        />

                        <View className="p-4 border-t border-gray-200">
                            <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                Batal
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
