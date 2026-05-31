import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  defaultLanguage,
  supportedLanguages,
} from "./features/configuration/domain/supported-language";

export { defaultLanguage, supportedLanguages };
export type { SupportedLanguage } from "./features/configuration/domain/supported-language";

export const resources = {
  en: {
    translation: {
      appShell: {
        navigation: {
          ariaLabel: "Finance navigation",
          assets: "Assets",
          dashboard: "Dashboard",
          distribution: "Distribution",
          investments: "Investments",
          loans: "Loans",
          participations: "Participations",
          recurringBudget: "Recurring budget",
          settings: "Settings",
          subtitle: "Family Finances",
        },
      },
      common: {
        actions: "Actions",
        add: "Add",
        cancel: "Cancel",
        close: "Close",
        delete: "Delete",
        retry: "Retry",
        save: "Save",
      },
      configuration: {
        language: {
          ariaLabel: "App language",
          browserDetected: "From this browser",
          description:
            "Choose the language used across Family-Fi. An explicit choice is saved on this device.",
          title: "Language",
        },
        languages: {
          en: {
            label: "English",
            native: "English",
          },
          fr: {
            label: "French",
            native: "Français",
          },
          ja: {
            label: "Japanese",
            native: "日本語",
          },
        },
        meta: {
          description: "Family-Fi app configuration.",
          title: "Family-Fi | Configuration",
        },
        page: {
          subtitle: "Adjust app-level preferences for this browser.",
          title: "Configuration",
        },
      },
      family: {
        budget: {
          addLine: "Add line",
          category: {
            monthlyTotal: "{{value}} per month",
          },
          columns: {
            actions: "Actions",
            amount: "Amount",
            recurrence: "Recurrence",
            title: "Title",
          },
          empty: {
            description: "Expenses and income you add will appear here.",
            title: "No recurring lines",
          },
          tableAriaLabel: "Recurring expense and income setup",
          title: "Recurring budget",
        },
        categoryModal: {
          label: "Name",
          title: "Add category",
        },
        deletion: {
          categoryDescription:
            "The category and linked lines will be permanently deleted.",
          categoryTitle: "Delete this category?",
          confirm: "Delete",
          lineDescription: "The line will be permanently deleted.",
          lineTitle: "Delete this line?",
          memberDescription:
            "The member, their professional category, and linked lines will be permanently deleted.",
          memberTitle: "Delete this member?",
        },
        error: {
          unavailableMessage: "The household is unavailable.",
          unavailableSubtitle:
            "The household configuration could not be retrieved.",
          unavailableTitle: "Household unavailable",
        },
        format: {
          amountRange: "{{min}} to {{max}}",
          recurrence: {
            everyMonths: "Every {{count}} months",
            monthly: "Every month",
            yearly: "Every year",
          },
        },
        line: {
          createTitle: "Add line",
          deleteLabel: "Delete {{title}}",
          deleteTooltip: "Delete line",
          editLabel: "Edit {{title}}",
          editTitle: "Edit line",
          editTooltip: "Edit line",
          fields: {
            amount: "Amount",
            category: "Category",
            description: "Description",
            maxAmount: "Maximum value",
            minAmount: "Minimum value",
            recurrence: "Recurrence",
            title: "Title",
          },
          noDescription: "No description.",
          selectCategory: "Select a category",
          selectRecurrence: "Select a recurrence",
          summaryTitle: "Line summary",
          useEstimate: "Use an estimate",
          validation: {
            amountNonZero: "Amount must be different from 0.",
            amountRequired: "Amount is required.",
            categoryRequired: "Category is required.",
            estimateSameSign:
              "Minimum and maximum values must use the same sign.",
            maxNonZero: "Maximum value must be different from 0.",
            maxRequired: "Maximum value is required.",
            minNonZero: "Minimum value must be different from 0.",
            minRequired: "Minimum value is required.",
            recurrenceRequired: "Recurrence is required.",
            titleRequired: "Title is required.",
          },
          viewLabel: "View {{title}}",
        },
        loading: {
          label: "Loading household",
        },
        localErrors: {
          duplicateCategoryLabel: "A category with this name already exists.",
          duplicateMemberName: "A member with this name already exists.",
        },
        memberModal: {
          label: "Name",
          title: "Add member",
        },
        meta: {
          description: "Household recurring finances setup.",
          title: "Family-Fi | Household",
        },
        sidebar: {
          categories: {
            addLabel: "Add category",
            title: "Categories",
          },
          members: {
            addLabel: "Add member",
            deleteLabel: "Delete {{name}}",
            deleteTooltip: "Delete member",
            subtitle_one: "{{count}} person",
            subtitle_other: "{{count}} people",
            title: "Members",
          },
        },
        summary: {
          annual: "Annual",
          ariaLabel: "Household summary",
          avg: "Avg.",
          max: "Max.",
          min: "Min.",
          monthly: "Monthly",
        },
      },
    },
  },
  fr: {
    translation: {
      appShell: {
        navigation: {
          ariaLabel: "Navigation finances",
          assets: "Patrimoine",
          dashboard: "Tableau de bord",
          distribution: "Distribution",
          investments: "Investissements",
          loans: "Prêts",
          participations: "Participations",
          recurringBudget: "Budget récurrent",
          settings: "Réglages",
          subtitle: "Family Finances",
        },
      },
      common: {
        actions: "Actions",
        add: "Ajouter",
        cancel: "Annuler",
        close: "Fermer",
        delete: "Supprimer",
        retry: "Réessayer",
        save: "Enregistrer",
      },
      configuration: {
        language: {
          ariaLabel: "Langue de l'application",
          browserDetected: "Depuis ce navigateur",
          description:
            "Choisissez la langue utilisée dans Family-Fi. Un choix explicite est enregistré sur cet appareil.",
          title: "Langue",
        },
        languages: {
          en: {
            label: "Anglais",
            native: "English",
          },
          fr: {
            label: "Français",
            native: "Français",
          },
          ja: {
            label: "Japonais",
            native: "日本語",
          },
        },
        meta: {
          description: "Configuration de l'application Family-Fi.",
          title: "Family-Fi | Configuration",
        },
        page: {
          subtitle:
            "Ajustez les préférences de l'application pour ce navigateur.",
          title: "Configuration",
        },
      },
      family: {
        budget: {
          addLine: "Ajouter une ligne",
          category: {
            monthlyTotal: "{{value}} par mois",
          },
          columns: {
            actions: "Actions",
            amount: "Montant",
            recurrence: "Récurrence",
            title: "Intitulé",
          },
          empty: {
            description: "Les dépenses et revenus ajoutés apparaîtront ici.",
            title: "Aucune ligne récurrente",
          },
          tableAriaLabel: "Configuration des dépenses et revenus récurrents",
          title: "Budget récurrent",
        },
        categoryModal: {
          label: "Nom",
          title: "Ajouter une catégorie",
        },
        deletion: {
          categoryDescription:
            "La catégorie ainsi que ses lignes associées seront supprimées définitivement.",
          categoryTitle: "Supprimer cette catégorie ?",
          confirm: "Supprimer",
          lineDescription: "La ligne sera supprimée définitivement.",
          lineTitle: "Supprimer cette ligne ?",
          memberDescription:
            "Le membre, sa catégorie professionnelle ainsi que ses lignes associées seront supprimés définitivement.",
          memberTitle: "Supprimer ce membre ?",
        },
        error: {
          unavailableMessage: "Le foyer est indisponible.",
          unavailableSubtitle:
            "La configuration du foyer n'a pas pu être récupérée.",
          unavailableTitle: "Foyer indisponible",
        },
        format: {
          amountRange: "{{min}} à {{max}}",
          recurrence: {
            everyMonths: "Tous les {{count}} mois",
            monthly: "Chaque mois",
            yearly: "Chaque année",
          },
        },
        line: {
          createTitle: "Ajouter une ligne",
          deleteLabel: "Supprimer {{title}}",
          deleteTooltip: "Supprimer la ligne",
          editLabel: "Modifier {{title}}",
          editTitle: "Modifier une ligne",
          editTooltip: "Modifier la ligne",
          fields: {
            amount: "Montant",
            category: "Catégorie",
            description: "Description",
            maxAmount: "Valeur maximale",
            minAmount: "Valeur minimale",
            recurrence: "Récurrence",
            title: "Intitulé",
          },
          noDescription: "Aucune description.",
          selectCategory: "Sélectionner une catégorie",
          selectRecurrence: "Sélectionner une récurrence",
          summaryTitle: "Résumé de ligne",
          useEstimate: "Utiliser une estimation",
          validation: {
            amountNonZero: "Le montant doit être différent de 0.",
            amountRequired: "Le montant est obligatoire.",
            categoryRequired: "La catégorie est obligatoire.",
            estimateSameSign:
              "Les valeurs minimale et maximale doivent avoir le même signe.",
            maxNonZero: "La valeur maximale doit être différente de 0.",
            maxRequired: "La valeur maximale est obligatoire.",
            minNonZero: "La valeur minimale doit être différente de 0.",
            minRequired: "La valeur minimale est obligatoire.",
            recurrenceRequired: "La récurrence est obligatoire.",
            titleRequired: "L'intitulé est obligatoire.",
          },
          viewLabel: "Voir {{title}}",
        },
        loading: {
          label: "Chargement du foyer",
        },
        localErrors: {
          duplicateCategoryLabel: "Une catégorie avec ce nom existe déjà.",
          duplicateMemberName: "Un membre avec ce nom existe déjà.",
        },
        memberModal: {
          label: "Nom",
          title: "Ajouter un membre",
        },
        meta: {
          description: "Configuration des finances récurrentes du foyer.",
          title: "Family-Fi | Foyer",
        },
        sidebar: {
          categories: {
            addLabel: "Ajouter une catégorie",
            title: "Catégories",
          },
          members: {
            addLabel: "Ajouter un membre",
            deleteLabel: "Supprimer {{name}}",
            deleteTooltip: "Supprimer le membre",
            subtitle_one: "{{count}} personne",
            subtitle_other: "{{count}} personnes",
            title: "Membres",
          },
        },
        summary: {
          annual: "Annuel",
          ariaLabel: "Résumé du foyer",
          avg: "Moy.",
          max: "Max.",
          min: "Min.",
          monthly: "Mensuel",
        },
      },
    },
  },
  ja: {
    translation: {
      appShell: {
        navigation: {
          ariaLabel: "家計ナビゲーション",
          assets: "資産",
          dashboard: "ダッシュボード",
          distribution: "分配",
          investments: "投資",
          loans: "ローン",
          participations: "持分",
          recurringBudget: "定期予算",
          settings: "設定",
          subtitle: "ファミリー・ファイナンス",
        },
      },
      common: {
        actions: "操作",
        add: "追加",
        cancel: "キャンセル",
        close: "閉じる",
        delete: "削除",
        retry: "再試行",
        save: "保存",
      },
      configuration: {
        language: {
          ariaLabel: "アプリの言語",
          browserDetected: "このブラウザから",
          description:
            "Family-Fi全体で使う言語を選びます。明示的な選択はこの端末に保存されます。",
          title: "言語",
        },
        languages: {
          en: {
            label: "英語",
            native: "English",
          },
          fr: {
            label: "フランス語",
            native: "Français",
          },
          ja: {
            label: "日本語",
            native: "日本語",
          },
        },
        meta: {
          description: "Family-Fiアプリの設定。",
          title: "Family-Fi | 設定",
        },
        page: {
          subtitle: "このブラウザで使うアプリ設定を調整します。",
          title: "設定",
        },
      },
      family: {
        budget: {
          addLine: "明細を追加",
          category: {
            monthlyTotal: "{{value}} / 月",
          },
          columns: {
            actions: "操作",
            amount: "金額",
            recurrence: "頻度",
            title: "項目",
          },
          empty: {
            description: "追加した支出と収入がここに表示されます。",
            title: "定期明細はありません",
          },
          tableAriaLabel: "定期的な支出と収入の設定",
          title: "定期予算",
        },
        categoryModal: {
          label: "名前",
          title: "カテゴリを追加",
        },
        deletion: {
          categoryDescription: "カテゴリと関連する明細は完全に削除されます。",
          categoryTitle: "このカテゴリを削除しますか？",
          confirm: "削除",
          lineDescription: "明細は完全に削除されます。",
          lineTitle: "この明細を削除しますか？",
          memberDescription:
            "メンバー、職業カテゴリ、関連する明細は完全に削除されます。",
          memberTitle: "このメンバーを削除しますか？",
        },
        error: {
          unavailableMessage: "世帯を利用できません。",
          unavailableSubtitle: "世帯設定を取得できませんでした。",
          unavailableTitle: "世帯を利用できません",
        },
        format: {
          amountRange: "{{min}}〜{{max}}",
          recurrence: {
            everyMonths: "{{count}}か月ごと",
            monthly: "毎月",
            yearly: "毎年",
          },
        },
        line: {
          createTitle: "明細を追加",
          deleteLabel: "{{title}}を削除",
          deleteTooltip: "明細を削除",
          editLabel: "{{title}}を編集",
          editTitle: "明細を編集",
          editTooltip: "明細を編集",
          fields: {
            amount: "金額",
            category: "カテゴリ",
            description: "説明",
            maxAmount: "最大値",
            minAmount: "最小値",
            recurrence: "頻度",
            title: "項目",
          },
          noDescription: "説明はありません。",
          selectCategory: "カテゴリを選択",
          selectRecurrence: "頻度を選択",
          summaryTitle: "明細サマリー",
          useEstimate: "見積もりを使う",
          validation: {
            amountNonZero: "金額は0以外にしてください。",
            amountRequired: "金額は必須です。",
            categoryRequired: "カテゴリは必須です。",
            estimateSameSign: "最小値と最大値は同じ符号にしてください。",
            maxNonZero: "最大値は0以外にしてください。",
            maxRequired: "最大値は必須です。",
            minNonZero: "最小値は0以外にしてください。",
            minRequired: "最小値は必須です。",
            recurrenceRequired: "頻度は必須です。",
            titleRequired: "項目は必須です。",
          },
          viewLabel: "{{title}}を表示",
        },
        loading: {
          label: "世帯を読み込み中",
        },
        localErrors: {
          duplicateCategoryLabel: "同じ名前のカテゴリがすでに存在します。",
          duplicateMemberName: "同じ名前のメンバーがすでに存在します。",
        },
        memberModal: {
          label: "名前",
          title: "メンバーを追加",
        },
        meta: {
          description: "世帯の定期的な収支設定。",
          title: "Family-Fi | 世帯",
        },
        sidebar: {
          categories: {
            addLabel: "カテゴリを追加",
            title: "カテゴリ",
          },
          members: {
            addLabel: "メンバーを追加",
            deleteLabel: "{{name}}を削除",
            deleteTooltip: "メンバーを削除",
            subtitle_other: "{{count}}人",
            title: "メンバー",
          },
        },
        summary: {
          annual: "年次",
          ariaLabel: "世帯サマリー",
          avg: "平均",
          max: "最大",
          min: "最小",
          monthly: "月次",
        },
      },
    },
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    fallbackLng: defaultLanguage,
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    load: "languageOnly",
    lng: defaultLanguage,
    react: {
      useSuspense: false,
    },
    resources,
    supportedLngs: [...supportedLanguages],
  });
}

export default i18n;
