import * as React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChangeText,
  onSelect,
  options,
  placeholder = 'Ketik untuk mencari...',
  label,
  isLoading = false,
  disabled = false,
  className = '',
}: AutocompleteInputProps) {
  const { colorScheme } = useColorScheme();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [filteredOptions, setFilteredOptions] = React.useState<AutocompleteOption[]>([]);

  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const placeholderColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#d1d5db';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const dropdownBgColor = isDark ? '#111827' : '#ffffff';
  const hoverBgColor = isDark ? '#374151' : '#f3f4f6';

  React.useEffect(() => {
    if (value && value.length > 0) {
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(value.toLowerCase()) ||
          option.sublabel?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      if (filtered.length > 0 && value.length >= 2) {
        setShowDropdown(true);
      }
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
    }
  }, [value, options]);

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option);
    onChangeText(option.label);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChangeText('');
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (filteredOptions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <View className={`relative ${className}`}>
      {label && <Text className="mb-2 text-sm font-medium">{label}</Text>}

      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          editable={!disabled}
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor: bgColor,
              borderColor: borderColor,
            },
          ]}
          className="web:ring-offset-background flex h-12 w-full rounded-md border px-3 py-2 text-base web:ring-offset-2 web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring"
        />

        {/* Icons */}
        <View className="absolute right-2 top-3 flex-row items-center gap-1">
          {value && !disabled && (
            <TouchableOpacity onPress={handleClear} className="p-1">
              <Icon as={XIcon} size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          )}
          <Icon as={ChevronDownIcon} size={18} className="text-muted-foreground" />
        </View>
      </View>

      {/* Dropdown Modal */}
      {showDropdown && filteredOptions.length > 0 && (
        <Modal transparent visible={showDropdown} onRequestClose={() => setShowDropdown(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDropdown(false)}
            className="flex-1">
            <View
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: dropdownBgColor,
                  borderColor: borderColor,
                },
              ]}
              className="mx-4 mt-2 max-h-80 rounded-lg border shadow-lg">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                className="max-h-80"
                showsVerticalScrollIndicator={true}>
                {isLoading ? (
                  <View className="p-4">
                    <Text className="text-center text-muted-foreground">Memuat...</Text>
                  </View>
                ) : filteredOptions.length === 0 ? (
                  <View className="p-4">
                    <Text className="text-center text-muted-foreground">Tidak ada hasil</Text>
                  </View>
                ) : (
                  filteredOptions.map((option, index) => (
                    <TouchableOpacity
                      key={`${option.value}-${index}`}
                      onPress={() => handleSelect(option)}
                      style={{
                        backgroundColor:
                          value === option.label ? hoverBgColor : 'transparent',
                      }}
                      className="border-b border-border px-4 py-3">
                      <Text className="font-medium">{option.label}</Text>
                      {option.sublabel && (
                        <Text className="text-xs text-muted-foreground">{option.sublabel}</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingRight: 70,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    marginTop: 80,
  },
});
