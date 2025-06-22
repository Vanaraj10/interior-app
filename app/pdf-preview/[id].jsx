import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PDFPreview() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
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
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const generatePDFContent = () => {
    if (!project) return '';

    const curtainMeasurements = project.measurements?.filter(m => m.interiorType === 'curtains') || [];
    const netMeasurements = project.measurements?.filter(m => m.interiorType === 'mosquito-nets') || [];
    const wallpaperMeasurements = project.measurements?.filter(m => m.interiorType === 'wallpapers') || [];

    const generateMeasurementRows = (measurements) => {
      return measurements.map((m, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.pieces?.toFixed(1)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.totalMeters?.toFixed(2)}m</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainType || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.clothCost || 0)}</div>
            <div style="font-size: 10px; color: #666;">${m.totalMeters?.toFixed(2)}m × ₹${m.clothRatePerMeter}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.stitchingCost || 0)}</div>
            <div style="font-size: 10px; color: #666;">${m.pieces?.toFixed(1)} × ₹${m.stitchingCostPerPiece}</div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCost || 0)}</td>
        </tr>
      `).join('');
    };

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

        ${curtainMeasurements.length > 0 ? `
        <div class="section-title">CURTAINS</div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Room Label</th>
              <th>Width</th>
              <th>Height</th>
              <th>Pieces</th>
              <th>Meters</th>
              <th>Type</th>
              <th>Cloth Price</th>
              <th>Stitching Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateMeasurementRows(curtainMeasurements)}
          </tbody>
        </table>
        ` : ''}

        ${netMeasurements.length > 0 ? `
        <div class="section-title">MOSQUITO NETS</div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Room Label</th>
              <th>Width</th>
              <th>Height</th>
              <th>Pieces</th>
              <th>Meters</th>
              <th>Type</th>
              <th>Material Price</th>
              <th>Installation Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateMeasurementRows(netMeasurements)}
          </tbody>
        </table>
        ` : ''}

        ${wallpaperMeasurements.length > 0 ? `
        <div class="section-title">WALLPAPERS</div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Room Label</th>
              <th>Width</th>
              <th>Height</th>
              <th>Pieces</th>
              <th>Meters</th>
              <th>Type</th>
              <th>Material Price</th>
              <th>Installation Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateMeasurementRows(wallpaperMeasurements)}
          </tbody>
        </table>
        ` : ''}

        ${curtainMeasurements.length > 0 ? `
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
          <tbody>
            ${curtainMeasurements.map(m => {
              const width = m.width || 0;
              const rate = m.rodRatePerLength || 200;
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
          ${project.rodCost > 0 ? `<div class="cost-row"><span>Rod Installation:</span><span>${formatCurrency(project.rodCost)}</span></div>` : ''}
          <div class="cost-row grand-total">
            <span>GRAND TOTAL:</span>
            <span>${formatCurrency(project.grandTotal || 0)}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Terms & Conditions:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>This quotation is valid for 15 days from the date of issue</li>
            <li>50% advance payment required to start work</li>
            <li>Installation will be completed within 7-10 working days</li>
            <li>All materials are of premium quality with warranty</li>
            <li>Final measurements will be taken before production</li>
          </ul>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 10px;">
              Customer Signature
            </div>
          </div>
          <div class="signature-box">
            <div style="border-top: 1px solid #333; margin-top: 40px; padding-top: 10px;">
              Authorized Signature<br>
              Royal Curtain
            </div>
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
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.printButton}
              onPress={printPDF}
            >
              <Ionicons name="print" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareButton, isGenerating && styles.disabledButton]}
              onPress={generateAndSharePDF}
              disabled={isGenerating}
            >
              <Ionicons name="share" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Preview Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.previewCard}>
          {/* Header Preview */}
          <View style={styles.previewHeader}>
            <Text style={styles.companyName}>ROYAL CURTAIN</Text>
            <Text style={styles.companySubtitle}>Interior Solutions & Custom Designs</Text>
          </View>

          {/* Client Info Preview */}
          <View style={styles.clientInfo}>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Client: {project.clientName}</Text>
              <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
            </View>
            <Text style={styles.clientText}>Phone: {project.phone}</Text>
            <Text style={styles.clientText}>Address: {project.address}</Text>
          </View>

          {/* Measurements Summary */}
          {project.measurements && project.measurements.length > 0 && (
            <View style={styles.measurementsSection}>
              <Text style={styles.sectionTitle}>Measurements Summary</Text>
              {project.measurements.map((measurement, index) => (
                <View key={measurement.id} style={styles.measurementRow}>
                  <View style={styles.measurementInfo}>
                    <Text style={styles.measurementLabel}>{measurement.roomLabel}</Text>
                    <Text style={styles.measurementDetails}>
                      {measurement.width}" × {measurement.height}" • {measurement.interiorType}
                    </Text>
                  </View>
                  <Text style={styles.measurementCost}>{formatCurrency(measurement.totalCost || 0)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Cost Summary */}
          <View style={styles.costSummary}>
            <Text style={styles.costSummaryTitle}>Cost Summary</Text>
            {project.curtainTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Curtains Subtotal:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.curtainTotal)}</Text>
              </View>
            )}
            {project.netTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Mosquito Nets Subtotal:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.netTotal)}</Text>
              </View>
            )}
            {project.wallpaperTotal > 0 && (
              <View style={styles.costRow}>
                <Text>Wallpapers Subtotal:</Text>
                <Text style={styles.costValue}>{formatCurrency(project.wallpaperTotal)}</Text>
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
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(project.grandTotal || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Preview */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions:</Text>
            <Text style={styles.termsText}>
              • Quotation valid for 15 days{'\n'}
              • 50% advance payment required{'\n'}
              • Installation within 7-10 working days{'\n'}
              • Premium quality materials with warranty
            </Text>
          </View>
        </View>
      </ScrollView>
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
  previewHeader: {
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  companySubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
});
