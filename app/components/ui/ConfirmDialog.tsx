import React from "react";
import { Alert, Text } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";

interface ConfirmDialogProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    confirmColor?: string;
    type?: "default" | "destructive";
}

export default function ConfirmDialog({ visible, onDismiss, title, message, confirmText = "Ya", cancelText = "Batal", onConfirm, confirmColor = "#16a34a", type = "default" }: ConfirmDialogProps) {
    const handleConfirm = () => {
        onDismiss();
        onConfirm();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text className="text-gray-700">{message}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor="#6b7280">
                        {cancelText}
                    </Button>
                    <Button onPress={handleConfirm} textColor={type === "destructive" ? "#dc2626" : confirmColor}>
                        {confirmText}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

// Utility function untuk konfirmasi cepat
export const showConfirmDialog = (title: string, message: string, onConfirm: () => void, confirmText = "Ya", cancelText = "Batal") => {
    Alert.alert(
        title,
        message,
        [
            {
                text: cancelText,
                style: "cancel",
            },
            {
                text: confirmText,
                onPress: onConfirm,
                style: "default",
            },
        ],
        { cancelable: true }
    );
};
