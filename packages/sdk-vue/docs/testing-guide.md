# Guide de Test du SDK `@reviewskits/vue`

Une fois que vous avez développé des fonctionnalités dans votre SDK, il est essentiel de les tester dans une application Vue.js réelle avant de les publier. Voici les méthodes recommandées.

---

## 1. Méthode `bun link` (Standard)

C'est la méthode intégrée à Bun. Elle crée un lien symbolique global vers votre package local.

### Étape 1 : Dans le répertoire du SDK
Exécutez la commande pour enregistrer le package localement :
```bash
bun link
```

### Étape 2 : Dans votre application de test
Allez dans le répertoire de votre application Vue et liez le SDK :
```bash
bun link @reviewskits/vue
```

> [!WARNING]
> `bun link` peut parfois causer des problèmes avec les dépendances partagées (comme `vue`). Si vous voyez des erreurs de type "Multiple instances of Vue", utilisez la méthode `yalc`.

---

## 2. Méthode `yalc` (Recommandée)

`yalc` est un outil fantastique qui simule une publication réelle sur un registre npm sans passer par le cloud. C'est beaucoup plus stable que `link`.

### Installation
```bash
bun add -g yalc
```

### Étape 1 : Dans le répertoire du SDK
Publiez localement :
```bash
yalc publish
```

### Étape 2 : Dans votre application de test
Installez depuis le "registre" local :
```bash
yalc add @reviewskits/vue
```

Pour mettre à jour après des modifications dans le SDK :
```bash
# Dans le SDK
yalc push # (publie et met à jour automatiquement les applications liées)
```

---

## 3. Utilisation d'un "Playground" interne

Pour un développement rapide, nous recommandons de maintenir un dossier `playground/` à la racine de ce dépôt.

### Configuration du Playground
Le playground est une application Vue 3 configurée pour utiliser le code source du SDK en direct.

1. Allez dans `playground/`
2. Installez les dépendances : `bun install`
3. Lancez le serveur de dev : `bun run dev`

Les modifications apportées au dossier `src/` du SDK seront immédiatement reflétées dans le playground s'il est configuré pour importer depuis `../src`.
