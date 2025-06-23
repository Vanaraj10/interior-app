import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InteriorSection({ 
  title, 
  icon, 
  measurements, 
  total, 
  onEdit, 
  onDelete 
}) {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  const MeasurementItem = ({ measurement }) => {
    // Custom rendering based on interior type
    if (measurement.interiorType === 'mosquito-nets') {
      return (
        <View style={styles.measurementItem}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementLabel}>{measurement.roomLabel}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(measurement)}
              >
                <Ionicons name="pencil" size={12} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(measurement.id)}
              >
                <Ionicons name="trash" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.measurementDetails}>
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementDimensions}>
                {measurement.width}" ({measurement.widthFeet}ft) × {measurement.height}" ({measurement.heightFeet}ft)
              </Text>
              <Text style={styles.measurementSpecs}>
                Material: {measurement.materialType || '-'} | Rate: ₹{measurement.materialRatePerSqft || 0}/sqft
              </Text>
              <Text style={styles.measurementSpecs}>
                Total Sqft: {measurement.totalSqft || 0} | Material Cost: {formatCurrency(measurement.materialCost || 0)}
              </Text>
              {measurement.customDescription ? (
                <Text style={styles.measurementSpecs}>
                  Note: {measurement.customDescription}
                </Text>
              ) : null}
            </View>
            <Text style={styles.measurementCost}>{formatCurrency(measurement.materialCost || 0)}</Text>
          </View>
        </View>
      );
    }
    if (measurement.interiorType === 'curtains') {
      return (
        <View style={styles.measurementItem}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementLabel}>{measurement.roomLabel}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(measurement)}
              >
                <Ionicons name="pencil" size={12} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(measurement.id)}
              >
                <Ionicons name="trash" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.measurementDetails}>
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementDimensions}>
                {measurement.width}" × {measurement.height}" {measurement.curtainType && `• ${measurement.curtainType}`}
              </Text>
              <Text style={styles.measurementSpecs}>
                {measurement.pieces?.toFixed(1)} pieces • {measurement.totalMeters?.toFixed(2)}m Cloth
              </Text>
              <Text style={styles.measurementSpecs}>
                Cloth: {formatCurrency(measurement.clothCost || 0)} | Stitching: {formatCurrency(measurement.stitchingCost || 0)}
              </Text>
            </View>
            <Text style={styles.measurementCost}>{formatCurrency(measurement.totalCost || 0)}</Text>
          </View>
        </View>
      );
    }
    if (measurement.interiorType === 'wallpapers') {
      return (
        <View style={styles.measurementItem}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementLabel}>{measurement.roomLabel}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(measurement)}
              >
                <Ionicons name="pencil" size={12} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(measurement.id)}
              >
                <Ionicons name="trash" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.measurementDetails}>
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementDimensions}>
                {measurement.width}" × {measurement.height}" • Wallpaper
              </Text>
              <Text style={styles.measurementSpecs}>
                {measurement.totalMeters?.toFixed(2)}m | Material: {formatCurrency(measurement.clothCost || 0)} | Install: {formatCurrency(measurement.stitchingCost || 0)}
              </Text>
            </View>
            <Text style={styles.measurementCost}>{formatCurrency(measurement.totalCost || 0)}</Text>
          </View>
        </View>
      );
    }
    // fallback (should not happen)
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name={icon} size={20} color="#3B82F6" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.totalAmount}>
          {formatCurrency(total)}
        </Text>
      </View>
      
      {measurements.length === 0 ? (
        <Text style={styles.emptyMessage}>
          No measurements added yet
        </Text>
      ) : (
        measurements.map((measurement) => (
          <MeasurementItem key={measurement.id} measurement={measurement} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  measurementItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  measurementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementInfo: {
    flex: 1,
  },
  measurementDimensions: {
    fontSize: 12,
    color: '#6b7280',
  },
  measurementSpecs: {
    fontSize: 12,
    color: '#9ca3af',
  },
  measurementCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});
