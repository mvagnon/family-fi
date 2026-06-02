import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  defaultLanguage,
  supportedLanguages,
} from "./features/configuration/domain/supported-language";

export type { SupportedLanguage } from "./features/configuration/domain/supported-language";
export { defaultLanguage, supportedLanguages };

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
      auth: {
        account: {
          openMenu: "Open account menu",
          sessionError: "Account connection could not be checked.",
          signOut: "Sign out",
          signOutError: "Sign out failed.",
        },
        login: {
          createAccount: "Create account",
          email: "Email",
          emailRequired: "Email is required.",
          error: "Invalid email or password.",
          password: "Password",
          passwordRequired: "Password is required.",
          submit: "Sign in",
          subtitle: "Access your Family-Fi workspace.",
          title: "Sign in",
        },
        meta: {
          loginDescription: "Family-Fi sign in.",
          loginTitle: "Family-Fi | Sign in",
        },
      },
      configuration: {
        defaultSpace: {
          description:
            "Choose the workspace selected when Family-Fi opens on this account.",
          empty: "No accessible spaces are available.",
          error: "Default space settings could not be loaded.",
          label: "Default space",
          loading: "Loading default space",
          placeholder: "Choose a space",
          saveError: "Default space could not be saved.",
          title: "Default space",
        },
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
      dashboard: {
        meta: {
          description: "Family-Fi dashboard.",
          title: "Family-Fi | Dashboard",
        },
        page: {
          title: "Dashboard",
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
          editTitle: "Edit member",
          isActive: "Active member",
          isActiveHelper:
            "Active members can participate financially and be selected in participations.",
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
            activeLabel: "Active member",
            activeTooltip: "Can participate financially",
            addLabel: "Add member",
            deleteLabel: "Delete {{name}}",
            deleteTooltip: "Delete member",
            editLabel: "Edit {{name}}",
            editTooltip: "Edit member",
            hideLabel: "Hide {{name}}",
            hideTooltip: "Hide member",
            showLabel: "Show {{name}}",
            showTooltip: "Show member",
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
      participations: {
        creation: {
          amount: "Amount",
          errors: {
            inactiveMember: "This member is no longer active.",
            missingMember: "This member no longer exists.",
            noActiveMember:
              "No active member is available for new participation lines.",
          },
          memberField: "Member",
          month: "Month",
          editTitle: "Edit participation line",
          title: "Add participation line",
          validation: {
            amountNonZero: "Amount must be different from 0.",
            amountRequired: "Amount is required.",
            memberRequired: "Member is required.",
            monthFuture: "Month cannot be after the current month.",
            monthRequired: "Month is required.",
            yearFuture: "Year cannot be after the current year.",
            yearRequired: "Year is required.",
          },
          year: "Year",
        },
        deletion: {
          lineDescription:
            "The participation line will be permanently deleted.",
          lineTitle: "Delete this participation line?",
        },
        line: {
          deleteLabel: "Delete {{label}}",
          deleteTooltip: "Delete participation",
          editLabel: "Edit {{label}}",
          editTooltip: "Edit participation",
        },
        meta: {
          description: "Family member participation tracking.",
          title: "Family-Fi | Participations",
        },
        metrics: {
          difference: "Difference",
          expenses: "Expenses",
          income: "Income",
        },
        table: {
          addLine: "Add participation",
          ariaLabel: "Monthly member participations",
          collapseMonth: "Collapse {{month}}",
          columns: {
            expense: "Expense",
            income: "Income",
            member: "Member",
          },
          empty: {
            description:
              "{{name}} has no participation expenses for this year.",
            memberLines: "No lines",
            noLinesInYear: "No participation line for this year.",
            noMember: "Add a family member to see participations.",
            title: "No participation expenses",
          },
          expandMonth: "Expand {{month}}",
          title: "Monthly participations",
        },
        top: {
          keyFigures: "Key figures",
          nextYear: "Next year",
          previousYear: "Previous year",
          selection: "Year",
          yearAriaLabel: "Participation year",
        },
      },
      spaces: {
        roles: {
          member: "Member",
          owner: "Owner",
        },
        switcher: {
          empty: "No spaces available.",
          error: "Spaces could not be loaded.",
          externalSpace: "Space of {{email}}",
          label: "Space",
          loading: "Loading spaces",
          ownerIndicator: "You own this space",
          personalSpace: "Personal space",
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
      auth: {
        account: {
          openMenu: "Ouvrir le menu du compte",
          sessionError: "La connexion au compte n'a pas pu être vérifiée.",
          signOut: "Déconnexion",
          signOutError: "La déconnexion a échoué.",
        },
        login: {
          createAccount: "Créer un compte",
          email: "Email",
          emailRequired: "L'email est obligatoire.",
          error: "Email ou mot de passe invalide.",
          password: "Mot de passe",
          passwordRequired: "Le mot de passe est obligatoire.",
          submit: "Se connecter",
          subtitle: "Accédez à votre espace Family-Fi.",
          title: "Connexion",
        },
        meta: {
          loginDescription: "Connexion à Family-Fi.",
          loginTitle: "Family-Fi | Connexion",
        },
      },
      configuration: {
        defaultSpace: {
          description:
            "Choisissez l'espace sélectionné par défaut à l'ouverture de Family-Fi pour ce compte.",
          empty: "Aucun espace accessible n'est disponible.",
          error: "Les réglages d'espace par défaut n'ont pas pu être chargés.",
          label: "Espace par défaut",
          loading: "Chargement de l'espace par défaut",
          placeholder: "Choisir un espace",
          saveError: "L'espace par défaut n'a pas pu être enregistré.",
          title: "Espace par défaut",
        },
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
      dashboard: {
        meta: {
          description: "Tableau de bord Family-Fi.",
          title: "Family-Fi | Tableau de bord",
        },
        page: {
          title: "Tableau de bord",
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
          editTitle: "Modifier un membre",
          isActive: "Membre actif",
          isActiveHelper:
            "Un membre actif peut participer financièrement et être sélectionné dans les participations.",
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
            activeLabel: "Membre actif",
            activeTooltip: "Peut participer financièrement",
            addLabel: "Ajouter un membre",
            deleteLabel: "Supprimer {{name}}",
            deleteTooltip: "Supprimer le membre",
            editLabel: "Modifier {{name}}",
            editTooltip: "Modifier le membre",
            hideLabel: "Masquer {{name}}",
            hideTooltip: "Masquer le membre",
            showLabel: "Afficher {{name}}",
            showTooltip: "Afficher le membre",
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
      participations: {
        creation: {
          amount: "Montant",
          errors: {
            inactiveMember: "Ce membre n'est plus actif.",
            missingMember: "Ce membre n'existe plus.",
            noActiveMember:
              "Aucun membre actif n'est disponible pour ajouter une ligne.",
          },
          memberField: "Membre",
          month: "Mois",
          editTitle: "Modifier une ligne de participation",
          title: "Ajouter une ligne de participation",
          validation: {
            amountNonZero: "Le montant doit être différent de 0.",
            amountRequired: "Le montant est obligatoire.",
            memberRequired: "Le membre est obligatoire.",
            monthFuture: "Le mois ne peut pas dépasser le mois actuel.",
            monthRequired: "Le mois est obligatoire.",
            yearFuture: "L'année ne peut pas dépasser l'année actuelle.",
            yearRequired: "L'année est obligatoire.",
          },
          year: "Année",
        },
        deletion: {
          lineDescription:
            "La ligne de participation sera définitivement supprimée.",
          lineTitle: "Supprimer cette ligne de participation ?",
        },
        line: {
          deleteLabel: "Supprimer {{label}}",
          deleteTooltip: "Supprimer la participation",
          editLabel: "Modifier {{label}}",
          editTooltip: "Modifier la participation",
        },
        meta: {
          description: "Suivi des participations par membre du foyer.",
          title: "Family-Fi | Participations",
        },
        metrics: {
          difference: "Différence",
          expenses: "Dépenses",
          income: "Revenus",
        },
        table: {
          addLine: "Ajouter une participation",
          ariaLabel: "Participations mensuelles par membre",
          collapseMonth: "Réduire {{month}}",
          columns: {
            expense: "Dépense",
            income: "Revenu",
            member: "Membre",
          },
          empty: {
            description:
              "{{name}} n'a aucune dépense de participation pour cette année.",
            memberLines: "Aucune ligne",
            noLinesInYear: "Aucune ligne de participation pour cette année.",
            noMember:
              "Ajoutez un membre du foyer pour afficher les participations.",
            title: "Aucune dépense de participation",
          },
          expandMonth: "Déplier {{month}}",
          title: "Participations mensuelles",
        },
        top: {
          keyFigures: "Chiffres clés",
          nextYear: "Année suivante",
          previousYear: "Année précédente",
          selection: "Année",
          yearAriaLabel: "Année des participations",
        },
      },
      spaces: {
        roles: {
          member: "Membre",
          owner: "Propriétaire",
        },
        switcher: {
          empty: "Aucun espace disponible.",
          error: "Les espaces n'ont pas pu être chargés.",
          externalSpace: "Espace de {{email}}",
          label: "Espace",
          loading: "Chargement des espaces",
          ownerIndicator: "Vous êtes propriétaire de cet espace",
          personalSpace: "Espace personnel",
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
      auth: {
        account: {
          openMenu: "アカウントメニューを開く",
          sessionError: "アカウント接続を確認できませんでした。",
          signOut: "ログアウト",
          signOutError: "ログアウトできませんでした。",
        },
        login: {
          createAccount: "アカウント作成",
          email: "メール",
          emailRequired: "メールは必須です。",
          error: "メールまたはパスワードが正しくありません。",
          password: "パスワード",
          passwordRequired: "パスワードは必須です。",
          submit: "ログイン",
          subtitle: "Family-Fiワークスペースにアクセスします。",
          title: "ログイン",
        },
        meta: {
          loginDescription: "Family-Fiのログイン。",
          loginTitle: "Family-Fi | ログイン",
        },
      },
      configuration: {
        defaultSpace: {
          description:
            "このアカウントでFamily-Fiを開いたときに最初に選択するスペースを選びます。",
          empty: "利用できるスペースはありません。",
          error: "既定スペースの設定を読み込めませんでした。",
          label: "既定スペース",
          loading: "既定スペースを読み込み中",
          placeholder: "スペースを選択",
          saveError: "既定スペースを保存できませんでした。",
          title: "既定スペース",
        },
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
      dashboard: {
        meta: {
          description: "Family-Fiダッシュボード。",
          title: "Family-Fi | ダッシュボード",
        },
        page: {
          title: "ダッシュボード",
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
          editTitle: "メンバーを編集",
          isActive: "有効なメンバー",
          isActiveHelper:
            "有効なメンバーは家計に参加でき、持分で選択できます。",
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
            activeLabel: "有効なメンバー",
            activeTooltip: "家計に参加できます",
            addLabel: "メンバーを追加",
            deleteLabel: "{{name}}を削除",
            deleteTooltip: "メンバーを削除",
            editLabel: "{{name}}を編集",
            editTooltip: "メンバーを編集",
            hideLabel: "{{name}}を非表示",
            hideTooltip: "メンバーを非表示",
            showLabel: "{{name}}を表示",
            showTooltip: "メンバーを表示",
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
      participations: {
        creation: {
          amount: "金額",
          errors: {
            inactiveMember: "このメンバーは現在有効ではありません。",
            missingMember: "このメンバーは存在しません。",
            noActiveMember: "新しい持分明細に使える有効なメンバーがいません。",
          },
          memberField: "メンバー",
          month: "月",
          editTitle: "持分明細を編集",
          title: "持分明細を追加",
          validation: {
            amountNonZero: "金額は0以外にしてください。",
            amountRequired: "金額は必須です。",
            memberRequired: "メンバーは必須です。",
            monthFuture: "月は現在の月を超えられません。",
            monthRequired: "月は必須です。",
            yearFuture: "年は現在の年を超えられません。",
            yearRequired: "年は必須です。",
          },
          year: "年",
        },
        deletion: {
          lineDescription: "持分明細は完全に削除されます。",
          lineTitle: "この持分明細を削除しますか？",
        },
        line: {
          deleteLabel: "{{label}}を削除",
          deleteTooltip: "持分を削除",
          editLabel: "{{label}}を編集",
          editTooltip: "持分を編集",
        },
        meta: {
          description: "家族メンバー別の持分追跡。",
          title: "Family-Fi | 持分",
        },
        metrics: {
          difference: "差額",
          expenses: "支出",
          income: "収入",
        },
        table: {
          addLine: "持分を追加",
          ariaLabel: "メンバー別の月次持分",
          collapseMonth: "{{month}}を折りたたむ",
          columns: {
            expense: "支出",
            income: "収入",
            member: "メンバー",
          },
          empty: {
            description: "{{name}}のこの年の持分支出はありません。",
            memberLines: "行はありません",
            noLinesInYear: "この年の持分明細はありません。",
            noMember: "持分を表示するには家族メンバーを追加してください。",
            title: "持分支出はありません",
          },
          expandMonth: "{{month}}を展開",
          title: "月次持分",
        },
        top: {
          keyFigures: "主要指標",
          nextYear: "翌年",
          previousYear: "前年",
          selection: "年",
          yearAriaLabel: "持分の年",
        },
      },
      spaces: {
        roles: {
          member: "メンバー",
          owner: "オーナー",
        },
        switcher: {
          empty: "利用できるスペースはありません。",
          error: "スペースを読み込めませんでした。",
          externalSpace: "{{email}} のスペース",
          label: "スペース",
          loading: "スペースを読み込み中",
          ownerIndicator: "このスペースのオーナーです",
          personalSpace: "個人スペース",
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
