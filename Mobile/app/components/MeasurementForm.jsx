import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { INTERIOR_SCHEMAS } from "./interiorSchemas";
import DynamicFields from "./DynamicFields";
import { COLORS } from "../styles/colors";

export default function MeasurementForm({
  onSave,
  onCancel,
  editingMeasurement,
  forceInteriorType,
}) {  const [formData, setFormData] = useState({
    interiorType: forceInteriorType || "curtains",
  });

  useEffect(() => {
    if (editingMeasurement) {
      setFormData(editingMeasurement);
    } else {
      // Ensure default values for pickers
      const interiorType = forceInteriorType || "curtains";
      setFormData((prev) => {
        const schema = INTERIOR_SCHEMAS[interiorType];
        const defaults = { interiorType };
        schema.fields.forEach((field) => {
          if (field.type === "picker" && !prev[field.name]) {
            defaults[field.name] = field.options[0];
          }
        });
        return { ...prev, ...defaults };
      });
    }
  }, [editingMeasurement, forceInteriorType]);  useEffect(() => {
    // Calculation is handled in the component that uses this form
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    for (const field of schema.fields) {
      if (
        field.required &&
        (formData[field.name] === undefined ||
          formData[field.name] === null ||
          formData[field.name].toString().trim() === "")
      ) {
        Alert.alert("Error", `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    // Convert all number fields to numbers BEFORE calculation
    const cleanedFormData = { ...formData };
    schema.fields.forEach((field) => {
      if (field.type === "number") {
        let val = cleanedFormData[field.name];
        if (typeof val === "string") val = val.replace(/[^\d.\-]/g, "");
        cleanedFormData[field.name] =
          val === "" || val === undefined || isNaN(Number(val))
            ? 0
            : Number(val);
      }
    });
    // Now run calculation with cleaned numbers
    const calc = schema.calculate(cleanedFormData);
    onSave({ ...cleanedFormData, ...calc, id: editingMeasurement?.id });
  };

  const schema = INTERIOR_SCHEMAS[formData.interiorType];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingMeasurement ? "Edit Measurement" : "Add Measurement"}
          </Text>
        </View>
      </View>{" "}
      <ScrollView style={styles.scrollView}>
        {/* Dynamic Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Details</Text>
          <DynamicFields
            schema={schema}
            formData={formData}
            updateField={updateField}
          />
        </View>
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {editingMeasurement ? "Update Measurement" : "Save Measurement"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: COLORS.textInverse,
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.inputText,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
  },
  picker: {
    height: 50,
    color: COLORS.inputText,
  },
  calculationSection: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  calculationGrid: {
    gap: 8,
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryLight,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  saveButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "bold",
  },
  readOnlyContainer: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
