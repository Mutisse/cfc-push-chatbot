import { UserSession, ISessionData } from '../models/UserSession';
import { User, IUser } from '../models/User';
import { PrayerRequest } from '../models/PrayerRequest';
import { AssistanceRequest } from '../models/AssistanceRequest';
import { logger } from '../config/logger';

export class UserStateService {
  static async getState(phone: string) {
    return await UserSession.findOne({ phone });
  }

  static async setState(phone: string, step: string, data?: Partial<ISessionData>) {
    const updateData: any = { 
      phone, 
      step, 
      lastInteraction: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    if (data) {
      updateData.$set = { data };
    }

    return await UserSession.findOneAndUpdate(
      { phone },
      updateData,
      { upsert: true, new: true }
    );
  }

  static async updateData(phone: string, data: Partial<ISessionData>) {
    return await UserSession.findOneAndUpdate(
      { phone },
      { 
        $set: { data },
        lastInteraction: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
  }

  static async deleteState(phone: string) {
    return await UserSession.findOneAndDelete({ phone });
  }

  static async resetToMainMenu(phone: string) {
    return await this.setState(phone, 'MAIN_MENU', {});
  }

  static async getUser(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone });
  }

  static async saveUser(phone: string, userData: Partial<IUser>) {
    return await User.findOneAndUpdate(
      { phone },
      { ...userData, lastInteraction: new Date() },
      { upsert: true, new: true }
    );
  }

  static async savePrayerRequest(prayerData: any) {
    return await PrayerRequest.create(prayerData);
  }

  static async saveAssistanceRequest(assistanceData: any) {
    return await AssistanceRequest.create(assistanceData);
  }
}