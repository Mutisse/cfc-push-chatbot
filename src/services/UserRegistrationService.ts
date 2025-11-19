import { User, IUser } from "../models/User";
import { UserStateService } from "./UserStateService";
import { UserValidator } from "../validators/UserValidator";
import { DateValidator } from "../validators/DateValidator";
import { logger } from "../config/logger";

export class UserRegistrationService {
  /**
   * Processar cadastro completo do usuário
   */
  static async completeUserRegistration(phone: string): Promise<{
    success: boolean;
    message: string;
    user?: IUser;
  }> {
    try {
      const session = await UserStateService.getState(phone);
      const userData = session?.data || {};

      // Validar dados obrigatórios
      const validation = this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || "Dados de cadastro inválidos",
        };
      }

      // Criar/atualizar usuário
      const user = await this.createOrUpdateUser(phone, userData);

      // Limpar estado da sessão
      await UserStateService.resetToMainMenu(phone);

      logger.info(`✅ Cadastro concluído: ${user.name} (${phone})`);

      return {
        success: true,
        message: this.generateSuccessMessage(user),
        user,
      };
    } catch (error) {
      logger.error("❌ Erro ao completar cadastro:", error);
      return {
        success: false,
        message:
          "❌ Erro ao processar seu cadastro. Por favor, tente novamente.",
      };
    }
  }

  /**
   * Validar dados do cadastro
   */
  private static validateRegistrationData(userData: any): {
    isValid: boolean;
    error?: string;
  } {
    // Validar nome
    const nameValidation = UserValidator.validateName(userData.name || "");
    if (!nameValidation.isValid) {
      return nameValidation;
    }

    // Validar data de nascimento
    if (userData.dateOfBirth) {
      const dateValidation = DateValidator.validateDate(userData.dateOfBirth);
      if (!dateValidation.isValid) {
        return dateValidation;
      }
    }

    // Validar endereço
    if (!userData.address || userData.address.trim().length < 10) {
      return {
        isValid: false,
        error: "Endereço muito curto. Mínimo 10 caracteres.",
      };
    }

    // Validar profissão
    if (!userData.profession || userData.profession.trim().length === 0) {
      return {
        isValid: false,
        error: "Profissão é obrigatória.",
      };
    }

    // Validar como conheceu
    if (!userData.howFoundChurch) {
      return {
        isValid: false,
        error: "Por favor, selecione como conheceu a igreja.",
      };
    }

    return { isValid: true };
  }

  /**
   * Criar ou atualizar usuário
   */
  private static async createOrUpdateUser(
    phone: string,
    userData: any
  ): Promise<IUser> {
    const userDataToSave: Partial<IUser> = {
      name: userData.name,
      dateOfBirth: userData.dateOfBirth
        ? new Date(userData.dateOfBirth.split("/").reverse().join("-"))
        : undefined,
      maritalStatus: userData.maritalStatus,
      address: userData.address,
      profession: userData.profession,
      howFoundChurch: userData.howFoundChurch,
      phone: phone,
      registrationDate: new Date(),
      isMember: true,
      lastInteraction: new Date(),
    };

    return await UserStateService.saveUser(phone, userDataToSave);
  }

  /**
   * Gerar mensagem de sucesso
   */
  private static generateSuccessMessage(user: IUser): string {
    return `🎉 *CADASTRO CONCLUÍDO!*\n\n*Irmão(ã) ${
      user.name
    }*, seu cadastro foi realizado com sucesso!\n\n*Dados registados:*\n• Nome: ${
      user.name
    }\n• Data Nasc.: ${
      user.dateOfBirth ? this.formatDate(user.dateOfBirth) : "Não informada"
    }\n• Estado Civil: ${user.maritalStatus || "Não informado"}\n• Profissão: ${
      user.profession
    }\n• Como conheceu: ${
      user.howFoundChurch
    }\n\n📞 Nossa equipe entrará em contato para boas-vindas e integração!\n\n*Bem-vindo(a) à família CFC PUSH!* 🙏\n\nDigite [#] para menu principal.`;
  }

  /**
   * Formatar data para exibição
   */
  private static formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("pt-BR");
  }

  /**
   * Buscar usuário por telefone
   */
  static async getUserByPhone(phone: string): Promise<IUser | null> {
    try {
      return await User.findOne({ phone });
    } catch (error) {
      logger.error("❌ Erro ao buscar usuário:", error);
      throw new Error("Falha ao buscar usuário");
    }
  }

  /**
   * Atualizar dados do usuário
   */
  static async updateUserData(
    phone: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { phone },
        {
          ...updateData,
          lastInteraction: new Date(),
        },
        { new: true }
      );

      if (updatedUser) {
        logger.info(`✅ Dados do usuário atualizados: ${phone}`);
      }

      return updatedUser;
    } catch (error) {
      logger.error("❌ Erro ao atualizar usuário:", error);
      throw new Error("Falha ao atualizar dados do usuário");
    }
  }

  /**
   * Listar todos os usuários com paginação
   */
  static async getAllUsers(
    options: {
      page?: number;
      limit?: number;
      isMember?: boolean;
    } = {}
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (options.isMember !== undefined) {
        query.isMember = options.isMember;
      }

      const [users, total] = await Promise.all([
        User.find(query).sort({ registrationDate: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("❌ Erro ao buscar usuários:", error);
      throw new Error("Falha ao buscar usuários");
    }
  }

  /**
   * Obter estatísticas de usuários
   */
  static async getUserStatistics(): Promise<{
    total: number;
    members: number;
    nonMembers: number;
    registrationsThisMonth: number;
    activeUsers: number;
  }> {
    try {
      const total = await User.countDocuments();
      const members = await User.countDocuments({ isMember: true });
      const nonMembers = await User.countDocuments({ isMember: false });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const registrationsThisMonth = await User.countDocuments({
        registrationDate: { $gte: startOfMonth },
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const activeUsers = await User.countDocuments({
        lastInteraction: { $gte: oneWeekAgo },
      });

      return {
        total,
        members,
        nonMembers,
        registrationsThisMonth,
        activeUsers,
      };
    } catch (error) {
      logger.error("❌ Erro ao buscar estatísticas de usuários:", error);
      throw new Error("Falha ao buscar estatísticas");
    }
  }

  /**
   * Verificar se usuário já está cadastrado
   */
  static async isUserRegistered(phone: string): Promise<boolean> {
    try {
      const user = await User.findOne({ phone });
      return !!user && user.isMember;
    } catch (error) {
      logger.error("❌ Erro ao verificar cadastro:", error);
      return false;
    }
  }
}
