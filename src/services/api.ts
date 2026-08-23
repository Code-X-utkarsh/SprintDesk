import type { MockData, User, Sprint, Task, TaskComment, Notification, ApiResponse } from '../types';
import mockDataRaw from '../data/mock-data.json';

/**
 * Data Access / Service Abstraction Layer
 * Isolates data fetching and parsing logic from UI components and query hooks.
 */

// In-memory typed snapshot of initial dataset
const mockData: MockData = mockDataRaw as MockData;

export const ApiService = {
  /**
   * Fetches full initial dataset
   */
  async getMockData(): Promise<ApiResponse<MockData>> {
    // Simulated async boundary to model network resolution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockData,
          status: 200,
          message: 'Mock data retrieved successfully',
        });
      }, 50);
    });
  },

  async getUsers(): Promise<ApiResponse<User[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData.users, status: 200 });
      }, 50);
    });
  },

  async getSprints(): Promise<ApiResponse<Sprint[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData.sprints, status: 200 });
      }, 50);
    });
  },

  async getTasks(): Promise<ApiResponse<Task[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData.tasks, status: 200 });
      }, 50);
    });
  },

  async getComments(): Promise<ApiResponse<TaskComment[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData.comments, status: 200 });
      }, 50);
    });
  },

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockData.notifications, status: 200 });
      }, 50);
    });
  },
};
