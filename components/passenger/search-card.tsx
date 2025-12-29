import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, SearchIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Combobox } from '@/components/ui/combobox';

interface ComboboxOption {
  value: string;
  label: string;
}

interface SearchCardProps {
  asal: string;
  setAsal: (value: string) => void;
  tujuan: string;
  setTujuan: (value: string) => void;
  tanggal: string;
  setTanggal: (value: string) => void;
  asalOptions: ComboboxOption[];
  tujuanOptions: ComboboxOption[];
  isLoadingAsal: boolean;
  isLoadingTujuan: boolean;
  handleSearch: () => void;
  setToday: () => void;
  setTomorrow: () => void;
}

function ComboboxInput({
  label,
  value,
  onSelect,
  options,
  placeholder,
}: {
  label?: string;
  value: string;
  onSelect: (option: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
}) {
  return (
    <View>
      {label && <Label className="mb-2">{label}</Label>}
      <Combobox
        options={options}
        value={value}
        onValueChange={(val) => {
          const option = options.find((o) => o.value === val);
          if (option) onSelect(option);
        }}
        placeholder={placeholder}
        className="w-full"
      />
    </View>
  );
}

export function SearchCard({
  asal,
  setAsal,
  tujuan,
  setTujuan,
  tanggal,
  setTanggal,
  asalOptions,
  tujuanOptions,
  isLoadingAsal,
  isLoadingTujuan,
  handleSearch,
  setToday,
  setTomorrow,
}: SearchCardProps) {
  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <Text className="text-lg font-semibold">Cari Tiket Bus</Text>

      <View className="gap-4">
        {/* Departure City */}
        <ComboboxInput
          label="Kota Asal"
          value={asal}
          onSelect={(option) => setAsal(option.label)}
          options={asalOptions.map((o) => ({ value: o.label, label: o.label }))}
          placeholder="Ketik kota asal (opsional)"
        />

        <ComboboxInput
          label="Kota Tujuan"
          value={tujuan}
          onSelect={(option) => setTujuan(option.label)}
          options={tujuanOptions.map((o) => ({ value: o.label, label: o.label }))}
          placeholder="Ketik kota tujuan (opsional)"
        />

        {/* Date */}
        <View className="gap-1.5">
          <Label>Tanggal Perjalanan</Label>
          <View className="relative">
            <View className="absolute left-3 top-3.5 z-10">
              <Icon as={CalendarIcon} className="size-5 text-muted-foreground" />
            </View>
            <Input
              placeholder="YYYY-MM-DD"
              value={tanggal}
              onChangeText={setTanggal}
              className="pl-10"
            />
          </View>
          {/*<View className="flex-row gap-2">
            <Button variant="outline" size="sm" onPress={setToday} className="flex-1">
              <Text className="text-xs">Hari Ini</Text>
            </Button>
            <Button variant="outline" size="sm" onPress={setTomorrow} className="flex-1">
              <Text className="text-xs">Besok</Text>
            </Button>
          </View>*/}
        </View>
      </View>

      <Text className="mb-2 text-xs text-muted-foreground">
        * Anda bisa mencari dengan hanya mengisi salah satu (asal atau tujuan)
      </Text>

      <Button className="mt-2 w-full" onPress={handleSearch} disabled={!asal && !tujuan}>
        <Icon as={SearchIcon} className="mr-2 size-5" />
        <Text>Cari Bus</Text>
      </Button>
    </View>
  );
}
