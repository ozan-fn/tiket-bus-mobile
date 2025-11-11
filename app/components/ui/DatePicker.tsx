import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput } from "react-native-paper";

interface DatePickerProps {
    label: string;
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
    error?: string;
    mode?: "date" | "time" | "datetime";
    minimumDate?: Date;
    maximumDate?: Date;
}

export default function DatePicker({ label, value, onChange, placeholder = "Pilih tanggal", error, mode = "date", minimumDate, maximumDate }: DatePickerProps) {
    const [isVisible, setIsVisible] = useState(false);

    const formatDate = (date: Date | null) => {
        if (!date) return "";

        if (mode === "time") {
            return date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (mode === "date") {
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } else {
            return date.toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    };

    const handleConfirm = (selectedDate: Date) => {
        setIsVisible(false);
        onChange(selectedDate);
    };

    const handleCancel = () => {
        setIsVisible(false);
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setIsVisible(true)}>
                <View pointerEvents="none">
                    <TextInput label={label} value={formatDate(value)} placeholder={placeholder} error={!!error} mode="outlined" right={<TextInput.Icon icon={mode === "time" ? "clock-outline" : "calendar-outline"} onPress={() => setIsVisible(true)} />} />
                </View>
            </TouchableOpacity>

            {error && <Text className="text-red-600 text-sm mt-1 ml-1">{error}</Text>}

            <DateTimePickerModal isVisible={isVisible} mode={mode} date={value || new Date()} onConfirm={handleConfirm} onCancel={handleCancel} minimumDate={minimumDate} maximumDate={maximumDate} locale="id-ID" confirmTextIOS="Konfirmasi" cancelTextIOS="Batal" />
        </View>
    );
}
