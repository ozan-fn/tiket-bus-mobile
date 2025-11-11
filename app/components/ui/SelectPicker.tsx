import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { FlatList, Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectPickerProps {
    label: string;
    value: string | number | null;
    onChange: (value: string | number) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export default function SelectPicker({ label, value, onChange, options, placeholder = "Pilih opsi", error, disabled = false }: SelectPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (selectedValue: string | number) => {
        onChange(selectedValue);
        setModalVisible(false);
    };

    if (Platform.OS === "ios") {
        // iOS: Gunakan Modal dengan FlatList
        return (
            <View>
                <TouchableOpacity onPress={() => !disabled && setModalVisible(true)} disabled={disabled}>
                    <View pointerEvents="none">
                        <TextInput label={label} value={selectedOption?.label || ""} placeholder={placeholder} error={!!error} mode="outlined" right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setModalVisible(true)} />} editable={false} />
                    </View>
                </TouchableOpacity>

                {error && <Text className="text-red-600 text-sm mt-1 ml-1">{error}</Text>}

                <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black bg-opacity-50">
                        <View className="bg-white rounded-t-lg max-h-96">
                            <View className="p-4 border-b border-gray-200">
                                <Text className="text-lg font-semibold text-center">{label}</Text>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity className={`p-4 border-b border-gray-100 ${item.value === value ? "bg-green-50" : ""}`} onPress={() => handleSelect(item.value)}>
                                        <Text className={`text-base ${item.value === value ? "text-green-600 font-semibold" : "text-gray-800"}`}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View className="p-4">
                                        <Text className="text-gray-500 text-center">Tidak ada opsi tersedia</Text>
                                    </View>
                                }
                            />

                            <View className="p-4">
                                <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                    Batal
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    } else {
        // Android: Gunakan Picker langsung
        return (
            <View>
                <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
                <View className="border border-gray-300 rounded-lg bg-white">
                    <Picker selectedValue={value || undefined} onValueChange={handleSelect} enabled={!disabled} style={{ height: 50 }}>
                        <Picker.Item label={placeholder} value={null} />
                        {options.map((option) => (
                            <Picker.Item key={option.value.toString()} label={option.label} value={option.value} />
                        ))}
                    </Picker>
                </View>

                {error && <Text className="text-red-600 text-sm mt-1 ml-1">{error}</Text>}
            </View>
        );
    }
}
