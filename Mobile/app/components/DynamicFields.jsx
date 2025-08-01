import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { COLORS } from '../styles/colors';

export default function DynamicFields({ schema, formData, updateField }) {
  if (!schema) return null;
  return (
    <>
      {schema.fields.map(field => {
        // Conditional display logic
        if (typeof field.showIf === 'function' && !field.showIf(formData)) return null;
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text>
            {field.type === 'text' || field.type === 'number' ? (
              <TextInput
                style={styles.input}
                value={formData[field.name] !== undefined && formData[field.name] !== null ? String(formData[field.name]) : ''}
                onChangeText={text => updateField(field.name, text)}
                placeholder={field.label}
                placeholderTextColor={COLORS.inputPlaceholder}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              />
            ) : null}
            {field.type === 'picker' ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData[field.name] || field.options[0]}
                  onValueChange={value => updateField(field.name, value)}
                  style={styles.picker}
                >
                  {field.options.map(opt => (
                    <Picker.Item key={opt} label={opt} value={opt} />
                  ))}
                </Picker>
              </View>
            ) : null}
            {field.type === 'checkbox' ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Switch
                  value={!!formData[field.name]}
                  onValueChange={val => updateField(field.name, val)}
                  trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                  thumbColor={formData[field.name] ? COLORS.primary : COLORS.gray500}
                  ios_backgroundColor={COLORS.gray300}
                />
                <Text style={[styles.label, {marginLeft: 8}]}>{field.label}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.inputText,
    backgroundColor: COLORS.inputBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: COLORS.inputBorderFocus,
    borderWidth: 2,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    color: COLORS.inputText,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 12,
  },
});
