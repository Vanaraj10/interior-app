import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from "./styles/colors";
import { calculateProjectTotals } from "./components/projectTotals";

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const recalculateProjectTotals = async (projects) => {
    return projects.map((project) => {
      // Only recalculate if grandTotal or flooringTotal is missing or zero
      if (!project.grandTotal || !project.flooringTotal || project.flooringTotal === 0) {
        return calculateProjectTotals(project);
      }
      return project;
    });
  };

  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        let loadedProjects = JSON.parse(projectsData);
        // Recalculate totals for all projects to ensure flooring is included
        loadedProjects = await recalculateProjectTotals(loadedProjects);
        setProjects(loadedProjects);
        // Optionally, persist recalculated projects back to storage
        await AsyncStorage.setItem("projects", JSON.stringify(loadedProjects));
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }, []);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const deleteProject = async (projectId) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedProjects = projects.filter(
                (p) => p.id !== projectId
              );
              await AsyncStorage.setItem(
                "projects",
                JSON.stringify(updatedProjects)
              );
              setProjects(updatedProjects);
            } catch (error) {
              console.error("Error deleting project:", error);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    // Only round cost values, no decimals
    return `₹${Math.ceil(amount).toLocaleString("en-IN")}`;
  };
  const ProjectCard = ({ project }) => (
    <View style={styles.projectCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
        style={styles.cardGradient}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectInfo}>
            <Text style={styles.clientName}>{project.clientName}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.primary} />
              <Text style={styles.phone}>{project.phone}</Text>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.primary} />
              <Text style={styles.address}>{project.address}</Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <Text style={styles.date}>
              {new Date(project.createdDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.projectFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.grandTotal}>
              {formatCurrency(project.grandTotal || 0)}
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push(`/project/${project.id}`)}
            >
              <Ionicons name="eye-outline" size={16} color="white" />
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => router.push(`/pdf-preview/${project.id}`)}
            >
              <Ionicons name="document-text-outline" size={16} color="white" />
              <Text style={styles.buttonText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProject(project.id)}
            >
              <Ionicons name="trash-outline" size={16} color="white" />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Logout handler
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      }
    })();
  }, []);
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.patternCircle, { 
            top: Math.random() * height,
            left: Math.random() * width,
            opacity: 0.05 + Math.random() * 0.1,
          }]} />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="home" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>ROYAL CURTAIN</Text>
              <Text style={styles.headerSubtitle}>Interior Solutions</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="white"
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color="rgba(255, 255, 255, 0.7)"
                />
              </View>
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptySubtitle}>Create your first quote!</Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push("/new-project")}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.createFirstGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.createFirstText}>Create Project</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new-project")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '300',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    color: 'white',
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createFirstButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createFirstGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createFirstText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  projectCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  projectInfo: {
    flex: 1,
    marginRight: 16,
  },
  clientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(' + COLORS.primary.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',') + ', 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  date: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 16,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  grandTotal: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.success,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pdfButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
