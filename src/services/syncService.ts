export const syncService = {
  async syncLocalChanges(): Promise<{ source: "local"; syncedAt: string }> {
    // TODO_OFFICIAL_DATA / CLOUD_SYNC:
    // Replace with Supabase Realtime or Firebase listeners once cloud accounts are enabled.
    return { source: "local", syncedAt: new Date().toISOString() };
  },
};
