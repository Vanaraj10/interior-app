import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "./styles/colors";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem("projects");
      if (projectsData) {
        setProjects(JSON.parse(projectsData));
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
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const ProjectCard = ({ project }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.clientName}>{project.clientName}</Text>
          <Text style={styles.phone}>{project.phone}</Text>
          <Text style={styles.address}>{project.address}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(project.createdDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.projectFooter}>
        <Text style={styles.grandTotal}>
          {formatCurrency(project.grandTotal || 0)}
        </Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/project/${project.id}`)}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={() => router.push(`/pdf-preview/${project.id}`)}
          >
            <Text style={styles.buttonText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProject(project.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Logout handler
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interiors</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.listContainer}>
          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptySubtitle}>Create your first quote!</Text>
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
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: COLORS.textInverse,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: COLORS.accentLight,
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  logoutText: {
    color: COLORS.textInverse,
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    // Allow text to wrap inside
    minWidth: 0,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    minWidth: 0,
  },
  projectInfo: {
    flex: 1,
    minWidth: 0,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  phone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  address: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
    textAlign: "right",
    maxWidth: 100,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.success,
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  viewButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 56,
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  pdfButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 56,
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 56,
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: 12,
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
