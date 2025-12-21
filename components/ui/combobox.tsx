import * as React from 'react';
import { View, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className={cn('relative', className)}>
      <TouchableOpacity onPress={() => setOpen(true)} className="relative">
        <Input
          value={selectedOption ? selectedOption.label : ''}
          placeholder={placeholder}
          editable={false}
          className={cn('pr-10', selectedOption && 'opacity-100')}
        />
        <View className="absolute right-3 top-3">
          <Icon as={ChevronsUpDownIcon} className="h-4 w-4 opacity-50" />
        </View>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView className="flex-1">
          <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)}>
            <View className="mx-4 mt-20 rounded-md border border-border bg-popover shadow-lg">
              <View className="p-2">
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChangeText={setSearchValue}
                  autoFocus
                />
              </View>
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onValueChange(item.value === value ? '' : item.value);
                      setOpen(false);
                      setSearchValue('');
                    }}
                    className="flex-row items-center p-2">
                    <Icon
                      as={CheckIcon}
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text className="p-2 text-center text-muted-foreground">No results found.</Text>
                }
              />
            </View>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
