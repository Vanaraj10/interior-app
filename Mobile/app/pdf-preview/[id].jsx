import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PDF_ROW_GENERATORS } from '../components/pdfGenerators';

const INTERIOR_TYPES = [
  {
    key: 'curtains',
    label: 'CURTAINS',
    generator: PDF_ROW_GENERATORS.curtains,
    columns: [
      'S.No', 'Room Label', 'Width', 'Height', 'Pieces', 'Meters', 'Type', 'Cloth Price', 'Stitching Price', 'Lining', 'Total Price'
    ],
  },
  {
    key: 'mosquito-nets',
    label: 'MOSQUITO NETS',
    generator: PDF_ROW_GENERATORS['mosquito-nets'],
    columns: [
      'S.No', 'Room Label', 'Width (in/ft)', 'Height (in/ft)', 'Material Type', 'Rate/Sqft (₹)', 'Total Sqft', 'Material Cost', 'Description'
    ],
  },
  {
    key: 'wallpapers',
    label: 'WALLPAPERS',
    generator: PDF_ROW_GENERATORS.wallpapers,
    columns: [
      'S.No',
      'Room Label',
      'Width (in)',
      'Height (in)',
      'Area (sqft)',
      'Rolls',
      'Material Cost',
      'Implementation Cost',
      'Total Cost',
    ],
  },
  {
    key: 'blinds',
    label: 'BLINDS',
    generator: PDF_ROW_GENERATORS.blinds,
    columns: [
      'S.No',
      'Room Label',
      'Height (in)',
      'Width (in)',
      'Total Sqft',
      'Blinds Cost',
      'Type',
      'Parts',
      'Cloth Required',
      'Cloth Cost',
      'Stitching Cost',
      'Total Cost',
    ],
  },
  {
    key: 'flooring',
    label: 'FLOORING',
    generator: PDF_ROW_GENERATORS.flooring,
    columns: [
      'S.No',
      'Room Label',
      'Length (ft)',
      'Width (ft)',
      'Area (sqft)',
      'Material Cost',
      'Labor Cost',
      'Total Cost',
    ],
  },
];

export default function PDFPreview() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const loadProject = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const currentProject = projects.find(p => p.id === id);
        if (currentProject) {
          setProject(currentProject);
        } else {
          Alert.alert('Error', 'Project not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const generatePDFContent = () => {
    if (!project) return '';
    let htmlSections = '';
    INTERIOR_TYPES.forEach(type => {
      const measurements = project.measurements?.filter(m => m.interiorType === type.key) || [];
      if (measurements.length > 0) {
        htmlSections += `
          <div class="section-title">${type.label}</div>
          <table>
            <thead>
              <tr>${type.columns.map(col => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${type.generator(measurements, formatCurrency)}
              ${type.generator.totals ? type.generator.totals(measurements, formatCurrency) : ''}
            </tbody>
          </table>
        `;
      }
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation - ${project.clientName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #3B82F6;
            margin-bottom: 5px;
          }
          .company-subtitle { 
            font-size: 14px; 
            color: #666;
          }
          .client-info { 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #3B82F6;
            margin: 25px 0 15px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            font-size: 12px;
          }
          th { 
            background-color: #3B82F6; 
            color: white; 
            padding: 10px 8px; 
            text-align: center;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td { 
            padding: 8px; 
            border: 1px solid #ddd;
          }
          .cost-summary { 
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .cost-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .grand-total { 
            border-top: 2px solid #3B82F6;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #3B82F6;
          }
          .footer { 
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">ROYAL CURTAIN</div>
          <div class="company-subtitle">Interior Solutions & Custom Designs</div>
        </div>

        <div class="client-info">
          <div class="info-row">
            <span><strong>Client Name:</strong> ${project.clientName}</span>
            <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span><strong>Phone:</strong> ${project.phone}</span>
            <span><strong>Project ID:</strong> ${project.id}</span>
          </div>
          <div class="info-row">
            <span><strong>Address:</strong> ${project.address}</span>
          </div>
        </div>

        ${htmlSections}

        ${project.measurements?.filter(m => m.interiorType === 'curtains').length > 0 ? `
        <div class="section-title">ROD INSTALLATION</div>
        <table>
          <thead>
            <tr>
              <th>Room Label</th>
              <th>Width (in)</th>
              <th>Length (Units)</th>
              <th>Rate per Unit (₹)</th>
              <th>Total Rod Cost</th>
            </tr>
          </thead>
          <tbody>            ${project.measurements.filter(m => m.interiorType === 'curtains').map(m => {
              const width = m.width || 0;
              const rate = m.rodRatePerLength || 0; // Use actual rate from measurement
              const length = width / 12;
              const cost = length * rate;
              return `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${width}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${length.toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${rate}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(cost)}</td>
              </tr>`;
            }).join('')}
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold;">Total Rod Cost</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(project.rodCost || 0)}</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        <div class="cost-summary">
          <h3 style="margin-top: 0; color: #3B82F6;">COST SUMMARY</h3>
          ${project.curtainTotal > 0 ? `<div class="cost-row"><span>Curtains Subtotal:</span><span>${formatCurrency(project.curtainTotal)}</span></div>` : ''}
          ${project.netTotal > 0 ? `<div class="cost-row"><span>Mosquito Nets Subtotal:</span><span>${formatCurrency(project.netTotal)}</span></div>` : ''}
          ${project.wallpaperTotal > 0 ? `<div class="cost-row"><span>Wallpapers Subtotal:</span><span>${formatCurrency(project.wallpaperTotal)}</span></div>` : ''}
          ${project.blindsTotal > 0 ? `<div class="cost-row"><span>Blinds Subtotal:</span><span>${formatCurrency(project.blindsTotal)}</span></div>` : ''}
          ${project.rodCost > 0 ? `<div class="cost-row"><span>Rod Installation:</span><span>${formatCurrency(project.rodCost)}</span></div>` : ''}
          <div class="cost-row grand-total">
            <span>GRAND TOTAL:</span>
            <span>${formatCurrency(project.grandTotal || 0)}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateAndSharePDF = async () => {
    if (!project) return;

    setIsGenerating(true);
    try {
      const htmlContent = generatePDFContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Quotation - ${project.clientName}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const printPDF = async () => {
    if (!project) return;

    try {
      const htmlContent = generatePDFContent();
      
      await Print.printAsync({
        html: htmlContent
      });
    } catch (error) {
      console.error('Error printing PDF:', error);
      Alert.alert('Error', 'Failed to print PDF');
    }
  };
  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>PDF Preview</Text>
              <Text style={styles.headerSubtitle}>{project.clientName}</Text>
            </View>
          </View>

        </View>
      </View>

      {/* Preview Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.previewCard}>
          {/* Short PDF summary: Grand Total and breakdown */}
          <Text style={styles.sectionTitle}>Quotation Summary</Text>
          <View style={styles.costSummary}>
            <Text style={styles.costSummaryTitle}>Cost Breakdown</Text>
            {project.curtainTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Curtains:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.curtainTotal)}</Text>
              </View>
            )}
            {project.netTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Mosquito Nets:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.netTotal)}</Text>
              </View>
            )}
            {project.wallpaperTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Wallpapers:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.wallpaperTotal)}</Text>
              </View>
            )}
            {project.blindsTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Blinds:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.blindsTotal)}</Text>
              </View>
            )}
            {project.flooringTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Flooring:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.flooringTotal)}</Text>
              </View>
            )}
            {project.rodCost > 0 && (
              <View style={styles.costRow}>
                <Text>Rod Installation:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.rodCost)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <View style={styles.totalRowContent}>
                <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(project.grandTotal || 0)}</Text>
              </View>
            </View>
          </View>
          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 12 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, minWidth: 0 }]} onPress={printPDF}>
              <Ionicons name="print" size={20} color="white" />
              <Text style={styles.buttonText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, minWidth: 0 }]} onPress={generateAndSharePDF}>
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 0, gap: 12 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, minWidth: 0 }]} onPress={async () => {
              // Upload logic as before
              try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  Alert.alert('Not Authenticated', 'Please login first.');
                  router.replace('/login');
                  return;
                }
                const htmlContent = generatePDFContent();
                const cleanedHtmlContent = htmlContent
                  .replace(/\\/g, '')
                  .replace(/>\s+</g, '><')
                  .replace(/[\n\r\t]+/g, ' ')
                  .replace(/\s{2,}/g, ' ')
                  .replace(/\"/g, '"')
                  .trim();
                const response = await fetch('https://interior-app.onrender.com/api/worker/projects', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    clientName: project.clientName,
                    phone: project.phone,
                    address: project.address,
                    html: cleanedHtmlContent,
                  })
                });
                if (response.ok) {
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                    router.replace('/');
                  }, 4000);
                } else if (response.status === 401) {
                  Alert.alert('Session Expired', 'Please login again.');
                  router.replace('/login');
                } else {
                  const data = await response.json();
                  Alert.alert('Upload Failed', data.error || 'Failed to upload project');
                }
              } catch (_error) {
                Alert.alert('Error', 'Could not upload project');
              }
            }}>
              <Ionicons name="cloud-upload" size={20} color="white" />
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" style={{ marginBottom: 12 }} />
            <Text style={styles.successText}>Quotation uploaded successfully</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  printButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#6b7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 24,
  },
  clientInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clientLabel: {
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clientText: {
    fontSize: 14,
    color: '#6b7280',
  },
  measurementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  measurementInfo: {
    flex: 1,
  },
  measurementLabel: {
    fontWeight: '500',
  },
  measurementDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  measurementCost: {
    fontWeight: '600',
  },
  costSummary: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  costSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costValue: {
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#3b82f6',
    paddingTop: 8,
    marginTop: 8,
  },
  totalRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  termsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  termsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successModal: {
    backgroundColor: '#d1fae5',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successText: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
