import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';

export default function DynamicFields({ schema, formData, updateField }) {
  if (!schema) return null;
  return (
    <>
      {schema.fields.map(field => {
        // Conditional display logic
        if (typeof field.showIf === 'function' && !field.showIf(formData)) return null;
        if (field.type === 'text' || field.type === 'number') {
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.name]?.toString() || ''}
                onChangeText={text => updateField(field.name, text)}
                placeholder={field.label}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              />
            </View>
          );
        }
        if (field.type === 'picker') {
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.label}>{field.label}</Text>
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
            </View>
          );
        }
        if (field.type === 'checkbox') {
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Switch
                  value={!!formData[field.name]}
                  onValueChange={val => updateField(field.name, val)}
                />
                <Text style={[styles.label, {marginLeft: 8}]}>{field.label}</Text>
              </View>
            </View>
          );
        }
        return null;
      })}
    </>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: 'black', // Explicitly set input text color to black
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white', // Ensure dropdown background is white
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: 'black', // Explicitly set dropdown text color to black
    backgroundColor: 'white',
  },
});
