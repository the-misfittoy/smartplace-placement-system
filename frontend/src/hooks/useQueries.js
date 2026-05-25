/**
 * src/hooks/useQueries.js
 * Secure TanStack Query implementations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import * as api from "@/API/api";

// ── Query Key Factory (Secures cache partitioning) ────────────────────────────
export const QK = {
  students:          ()         => ["students"],
  student:           (id)       => ["students", id],
  companies:         ()         => ["companies"],
  company:           (id)       => ["companies", id],
  drives:            ()         => ["drives"],
  rounds:            ()         => ["rounds"],
  applications:      (params)   => ["applications", params],
  results:           ()         => ["results"],
  offers:            ()         => ["offers"],
  placed:            ()         => ["placed-students"],
  strategy:          (id)       => ["strategy", id],
  simulator:         (id, cgpa) => ["simulator", id, cgpa],
  rejection:         (id)       => ["rejection", id],
  dreamApplications: (id)       => ["dream-applications", id],
  dreamEligible:     (id)       => ["dream-eligible", id],
  tpoDashboard:      ()         => ["tpo-dashboard"],
  studentDashboard:  (id)       => ["student-dashboard", id],
  companyDashboard:  ()         => ["company-dashboard"],
  dashboardSummary:  ()         => ["dashboard-summary"],
  dmContacts:        ()         => ["dm-contacts"],
  dmHistory:         (id)       => ["dm-history", id],
  tpoRisk:           ()         => ["tpo-risk"],
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE CRUD HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useStudents() {
  return useQuery({ queryKey: QK.students(), queryFn: api.getStudents, staleTime: 30_000 });
}

export function useStudent(id) {
  return useQuery({ queryKey: QK.student(id), queryFn: () => api.getStudent(id), enabled: !!id, staleTime: 30_000 });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createStudent, onSuccess: () => qc.invalidateQueries({ queryKey: QK.students() }) });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateStudent,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.students() });
      qc.invalidateQueries({ queryKey: QK.student(vars.id) });
    },
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateStudentProfile,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.student(vars.id) });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteStudent, onSuccess: () => qc.invalidateQueries({ queryKey: QK.students() }) });
}

export function useCompanies() {
  return useQuery({ queryKey: QK.companies(), queryFn: api.getCompanies, staleTime: 60_000 });
}

export function useDrives() {
  return useQuery({ queryKey: QK.drives(), queryFn: api.getDrives, staleTime: 30_000 });
}

export function useCreateDrive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDrive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.drives() });
    },
  });
}

export function useRounds() {
  return useQuery({ queryKey: QK.rounds(), queryFn: api.getRounds, staleTime: 30_000 });
}

export function useCreateRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRound,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.rounds() });
    },
  });
}

export function useApplications() {
  const { user } = useAuthStore();
  const params = user?.role === "student" ? { student_id: user.student_id } : {};
  return useQuery({
    queryKey: QK.applications(params),
    queryFn: () => api.getApplications(params),
    enabled: !!user,
    staleTime: 20_000,
  });
}

export function useApplyForDrive() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: api.applyForDrive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.drives() });
      qc.invalidateQueries({ queryKey: QK.applications({ student_id: user?.student_id }) });
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.updateApplication, onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }) });
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW HOOKS (Results, Offers, Placements)
// ─────────────────────────────────────────────────────────────────────────────

export function useResults() {
  return useQuery({ queryKey: QK.results(), queryFn: api.getResults, staleTime: 20_000 });
}

export function useAddResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addResult,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.results() });
      qc.invalidateQueries({ queryKey: ["applications"] }); 
    },
  });
}

export function useOffers() {
  return useQuery({ queryKey: QK.offers(), queryFn: api.getOffers, staleTime: 20_000 });
}

export const useUpdateOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.offers() });
      qc.invalidateQueries({ queryKey: QK.placed() });
    },
  });
};

export function useStudentOffers() {
  return useQuery({
    queryKey: ["student-offers"],
    queryFn: api.getStudentOffers,
    staleTime: 10_000,
  });
}

export function usePlacedStudents() {
  return useQuery({ queryKey: QK.placed(), queryFn: api.getPlacedStudents, staleTime: 60_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART FEATURES
// ─────────────────────────────────────────────────────────────────────────────

export function useStrategy(studentId) {
  return useQuery({ queryKey: QK.strategy(studentId), queryFn: () => api.getStrategy(studentId), enabled: !!studentId, staleTime: 120_000 });
}

export function useSimulator(studentId, targetCgpa, studentCgpa) {
  return useQuery({
    queryKey: QK.simulator(studentId, targetCgpa),
    queryFn: () => api.getSimulator(studentId, targetCgpa),
    enabled: !!studentId && targetCgpa !== null && targetCgpa !== undefined && targetCgpa !== studentCgpa,
    staleTime: 120_000,
    placeholderData: (prev) => prev, 
  });
}

export function useRejectionAnalysis(studentId) {
  return useQuery({ queryKey: QK.rejection(studentId), queryFn: () => api.getRejectionAnalysis(studentId), enabled: !!studentId, staleTime: 120_000 });
}

export function useDreamApplications(studentId) {
  return useQuery({ queryKey: QK.dreamApplications(studentId), queryFn: () => api.getDreamApplications(studentId), enabled: !!studentId, staleTime: 60_000 });
}

export function useDreamEligibleDrives(studentId, isPlaced) {
  return useQuery({
    queryKey: QK.dreamEligible(studentId),
    queryFn: () => api.getDreamEligibleDrives(studentId),
    enabled: !!studentId && isPlaced,
    staleTime: 60_000,
    retry: (count, err) => err?.response?.status !== 400 && count < 2,
  });
}

export function useApplyDreamCompany() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: api.applyDreamCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.dreamApplications(user?.student_id) });
      qc.invalidateQueries({ queryKey: QK.applications({ student_id: user?.student_id }) });
    },
  });
}

export function useSendChatMessage() {
  return useMutation({ mutationFn: api.sendChatMessage });
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useTpoDashboard() {
  return useQuery({ queryKey: QK.tpoDashboard(), queryFn: api.getTpoDashboard, staleTime: 60_000 });
}

export function useStudentDashboard(studentId) {
  return useQuery({ 
    queryKey: QK.studentDashboard(studentId), 
    queryFn: () => api.getStudentDashboard(studentId), 
    enabled: !!studentId, 
    staleTime: 60_000 
  });
}

export function useCompanyDashboard() {
  return useQuery({ queryKey: QK.companyDashboard(), queryFn: api.getCompanyDashboard, staleTime: 60_000 });
}

export function useDashboardSummary() {
  return useQuery({ queryKey: QK.dashboardSummary(), queryFn: api.getDashboardSummary, staleTime: 60_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT MESSAGES (DMs)
// ─────────────────────────────────────────────────────────────────────────────
export function useDmContacts() {
  return useQuery({ queryKey: QK.dmContacts(), queryFn: api.getDmContacts, staleTime: 5000, refetchInterval: 5000 });
}

export function useDmHistory(contactId) {
  return useQuery({
    queryKey: QK.dmHistory(contactId),
    queryFn: () => api.getDmHistory(contactId),
    enabled: !!contactId,
    staleTime: 2000,
    refetchInterval: 3000,
  });
}

export function useSendDmMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.sendDmMessage,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QK.dmContacts() });
      qc.invalidateQueries({ queryKey: QK.dmHistory(vars.receiver_id) });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED AI/ML HOOKS
// ─────────────────────────────────────────────────────────────────────────────
export function useTpoRisk() {
  return useQuery({ queryKey: QK.tpoRisk(), queryFn: api.getTpoPlacementRisk, staleTime: 30_000 });
}

export function useGenerateCoachingStrategy() {
  return useMutation({
    mutationFn: api.generateCoachingStrategy
  });
}

export function useHrSemanticSearch() {
  return useMutation({
    mutationFn: api.hrSemanticSearch
  });
}

export function useSubmitMockAnswer() {
  return useMutation({
    mutationFn: api.submitMockAnswer
  });
}