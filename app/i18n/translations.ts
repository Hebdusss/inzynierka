export type Locale = 'pl' | 'en'

export const translations = {
  // Navigation
  'nav.home': { en: 'Home', pl: 'Strona główna' },
  'nav.workouts': { en: 'Workouts & Diets', pl: 'Treningi i diety' },
  'nav.addNew': { en: 'Add new', pl: 'Dodaj nowe' },
  'nav.sets': { en: 'Sets', pl: 'Zestawy' },
  'nav.calendar': { en: 'Calendar', pl: 'Kalendarz' },

  // Sidebar
  'sidebar.createAccount': { en: 'Create account', pl: 'Utwórz konto' },
  'sidebar.signIn': { en: 'Sign in', pl: 'Zaloguj się' },
  'sidebar.logout': { en: 'Logout', pl: 'Wyloguj' },

  // Home page
  'home.badge': { en: 'Fitness Tracker', pl: 'Fitness Tracker' },
  'home.welcome': { en: 'Welcome to', pl: 'Witaj w' },
  'home.description': {
    en: 'A fitness platform designed for those who want to track and improve their healthy lifestyle. Create custom workouts, plan your diets, and combine them into training sets.',
    pl: 'Platforma fitness stworzona dla tych, którzy chcą śledzić i poprawiać swój zdrowy styl życia. Twórz własne treningi, planuj diety i łącz je w zestawy treningowe.',
  },
  'home.feat1.title': { en: 'Add workouts & diets', pl: 'Dodaj treningi i diety' },
  'home.feat1.desc': {
    en: 'Create personalized workouts with details like body part, reps, series, weight and calories. Add diets with full nutritional information.',
    pl: 'Twórz spersonalizowane treningi z detalami jak partia ciała, powtórzenia, serie, waga i kalorie. Dodawaj diety z pełnymi informacjami żywieniowymi.',
  },
  'home.feat2.title': { en: 'Create training sets', pl: 'Twórz zestawy treningowe' },
  'home.feat2.desc': {
    en: 'Combine your workouts and diets into training sets. Track calories burned, consumed and total workout duration.',
    pl: 'Łącz treningi i diety w zestawy. Śledź spalone kalorie, spożyte kalorie i całkowity czas treningu.',
  },
  'home.feat3.title': { en: 'Explore & share', pl: 'Przeglądaj i udostępniaj' },
  'home.feat3.desc': {
    en: 'Browse all your workouts, diets and sets. Search through your collection and explore public sets from other users.',
    pl: 'Przeglądaj swoje treningi, diety i zestawy. Przeszukuj kolekcję i odkrywaj publiczne zestawy innych użytkowników.',
  },
  'home.stat.free': { en: 'Free to use', pl: 'Darmowy' },
  'home.stat.easy': { en: 'To get started', pl: 'Start' },
  'home.stat.fast': { en: 'Performance', pl: 'Wydajność' },
  'home.stat.share': { en: 'With community', pl: 'Ze społecznością' },
  'home.stat.freeVal': { en: '100%', pl: '100%' },
  'home.stat.easyVal': { en: 'Easy', pl: 'Łatwy' },
  'home.stat.fastVal': { en: 'Fast', pl: 'Wysoka' },
  'home.stat.shareVal': { en: 'Share', pl: 'Dziel się' },
  'home.gallery': { en: 'Kacper Hebda - Athlete & Inspiration', pl: 'Kacper Hebda - Sportowiec i inspiracja' },
  'home.todayTraining': { en: "Today's Training", pl: 'Dzisiejszy trening' },
  'home.tomorrowTraining': { en: "Tomorrow's Training", pl: 'Jutrzejszy trening' },
  'home.noTrainingToday': { en: 'No training planned for today', pl: 'Brak treningu na dziś' },
  'home.noTrainingTomorrow': { en: 'No training planned for tomorrow', pl: 'Brak treningu na jutro' },
  'home.burned': { en: 'Burned', pl: 'Spalone' },
  'home.consumed': { en: 'Consumed', pl: 'Spożyte' },
  'home.time': { en: 'Time', pl: 'Czas' },
  'home.done': { en: 'Done!', pl: 'Zrobione!' },
  'home.loginToSee': { en: 'Log in to see your training plan', pl: 'Zaloguj się, aby zobaczyć plan treningowy' },
  'home.exercises': { en: 'Exercises', pl: 'Ćwiczenia' },
  'home.diet': { en: 'Diet', pl: 'Dieta' },
  'home.set': { en: 'Set', pl: 'Zestaw' },
  'home.reps': { en: 'reps', pl: 'powt.' },
  'home.series': { en: 'series', pl: 'serie' },
  'home.kg': { en: 'kg', pl: 'kg' },

  // Workouts page
  'workouts.title': { en: 'Workouts & Diets', pl: 'Treningi i diety' },
  'workouts.yourWorkouts': { en: 'Your Workouts', pl: 'Twoje treningi' },
  'workouts.searchWorkouts': { en: 'Search workouts...', pl: 'Szukaj treningów...' },
  'workouts.noWorkouts': { en: 'No workouts yet', pl: 'Brak treningów' },
  'workouts.addFirst': { en: 'Add your first workout to get started', pl: 'Dodaj swój pierwszy trening, żeby zacząć' },

  // Workout card
  'workout.reps': { en: 'Reps', pl: 'Powt.' },
  'workout.series': { en: 'Series', pl: 'Serie' },
  'workout.break': { en: 'Break', pl: 'Przerwa' },
  'workout.weight': { en: 'Weight', pl: 'Waga' },
  'workout.calories': { en: 'Calories', pl: 'Kalorie' },
  'workout.edit': { en: 'Edit', pl: 'Edytuj' },
  'workout.delete': { en: 'Delete', pl: 'Usuń' },

  // Workout edit
  'workout.editTitle': { en: 'Edit workout', pl: 'Edytuj trening' },
  'workout.cancel': { en: 'Cancel', pl: 'Anuluj' },
  'workout.save': { en: 'Save', pl: 'Zapisz' },
  'workout.name': { en: 'Name', pl: 'Nazwa' },
  'workout.bodyPart': { en: 'Body part', pl: 'Partia ciała' },
  'workout.breakMin': { en: 'Break (min)', pl: 'Przerwa (min)' },
  'workout.weightKg': { en: 'Weight (kg)', pl: 'Waga (kg)' },

  // New workout form
  'newWorkout.title': { en: 'Add new workout', pl: 'Dodaj nowy trening' },
  'newWorkout.name': { en: 'Workout name', pl: 'Nazwa treningu' },
  'newWorkout.namePlaceholder': { en: 'e.g. Bench Press', pl: 'np. Wyciskanie sztangi' },
  'newWorkout.bodyPart': { en: 'Body part', pl: 'Partia ciała' },
  'newWorkout.pickOne': { en: 'Pick one', pl: 'Wybierz' },
  'newWorkout.reps': { en: 'Reps', pl: 'Powtórzenia' },
  'newWorkout.breakTime': { en: 'Break time (min)', pl: 'Przerwa (min)' },
  'newWorkout.pick': { en: 'Pick', pl: 'Wybierz' },
  'newWorkout.series': { en: 'Series', pl: 'Serie' },
  'newWorkout.weight': { en: 'Weight (kg)', pl: 'Waga (kg)' },
  'newWorkout.caloriesBurned': { en: 'Calories burned', pl: 'Spalone kalorie' },
  'newWorkout.submit': { en: 'Add workout', pl: 'Dodaj trening' },
  'newWorkout.success': { en: 'Workout added successfully!', pl: 'Trening dodany pomyślnie!' },
  'newWorkout.failed': { en: 'Failed to add workout', pl: 'Nie udało się dodać treningu' },
  'newWorkout.fillName': { en: 'Fill Workout name field', pl: 'Wypełnij nazwę treningu' },
  'newWorkout.selectBodyPart': { en: 'Select Body part', pl: 'Wybierz partię ciała' },
  'newWorkout.selectBreaks': { en: 'Select breaks time', pl: 'Wybierz czas przerwy' },
  'newWorkout.selectSeries': { en: 'Select series number', pl: 'Wybierz liczbę serii' },
  'newWorkout.weightError': { en: 'Set correct value to weight field', pl: 'Podaj prawidłową wagę' },
  'newWorkout.caloriesError': { en: 'Set correct value to calories field', pl: 'Podaj prawidłową liczbę kalorii' },

  // Body parts
  'bodyPart.Chest': { en: 'Chest', pl: 'Klatka piersiowa' },
  'bodyPart.Biceps': { en: 'Biceps', pl: 'Biceps' },
  'bodyPart.Triceps': { en: 'Triceps', pl: 'Triceps' },
  'bodyPart.Legs': { en: 'Legs', pl: 'Nogi' },
  'bodyPart.Shoulders': { en: 'Shoulders', pl: 'Barki' },
  'bodyPart.Back': { en: 'Back', pl: 'Plecy' },

  // Diets page
  'diets.yourDiets': { en: 'Your Diets', pl: 'Twoje diety' },
  'diets.searchDiets': { en: 'Search diets...', pl: 'Szukaj diet...' },
  'diets.noDiets': { en: 'No diets yet', pl: 'Brak diet' },
  'diets.addFirst': { en: 'Add your first diet to get started', pl: 'Dodaj swoją pierwszą dietę, żeby zacząć' },

  // Diet card
  'diet.calories': { en: 'Calories', pl: 'Kalorie' },
  'diet.proteins': { en: 'Proteins', pl: 'Białko' },
  'diet.fats': { en: 'Fats', pl: 'Tłuszcze' },
  'diet.carbs': { en: 'Carbs', pl: 'Węgle' },
  'diet.vitamins': { en: 'Vitamins', pl: 'Witaminy' },
  'diet.edit': { en: 'Edit', pl: 'Edytuj' },
  'diet.delete': { en: 'Delete', pl: 'Usuń' },

  // Diet edit
  'diet.editTitle': { en: 'Edit diet', pl: 'Edytuj dietę' },
  'diet.cancel': { en: 'Cancel', pl: 'Anuluj' },
  'diet.save': { en: 'Save', pl: 'Zapisz' },
  'diet.name': { en: 'Name', pl: 'Nazwa' },
  'diet.grams': { en: 'Grams', pl: 'Gramy' },
  'diet.proteinsG': { en: 'Proteins (g)', pl: 'Białko (g)' },
  'diet.fatsG': { en: 'Fats (g)', pl: 'Tłuszcze (g)' },
  'diet.carbsG': { en: 'Carbs (g)', pl: 'Węgle (g)' },

  // New diet form
  'newDiet.title': { en: 'Add new diet', pl: 'Dodaj nową dietę' },
  'newDiet.name': { en: 'Diet name', pl: 'Nazwa diety' },
  'newDiet.namePlaceholder': { en: 'e.g. Chicken Breast', pl: 'np. Pierś z kurczaka' },
  'newDiet.grams': { en: 'Grams', pl: 'Gramy' },
  'newDiet.calories': { en: 'Calories', pl: 'Kalorie' },
  'newDiet.proteins': { en: 'Proteins (g)', pl: 'Białko (g)' },
  'newDiet.fats': { en: 'Fats (g)', pl: 'Tłuszcze (g)' },
  'newDiet.carbs': { en: 'Carbohydrates (g)', pl: 'Węglowodany (g)' },
  'newDiet.vitaminsLabel': { en: 'Vitamins & minerals', pl: 'Witaminy i minerały' },
  'newDiet.vitGroup': { en: 'Vitamins', pl: 'Witaminy' },
  'newDiet.minGroup': { en: 'Minerals & other', pl: 'Minerały i inne' },
  'newDiet.selected': { en: 'Selected', pl: 'Wybrano' },
  'newDiet.submit': { en: 'Add diet', pl: 'Dodaj dietę' },
  'newDiet.success': { en: 'Diet added successfully!', pl: 'Dieta dodana pomyślnie!' },
  'newDiet.failed': { en: 'Failed to add diet', pl: 'Nie udało się dodać diety' },
  'newDiet.fillName': { en: 'Fill diet name field', pl: 'Wypełnij nazwę diety' },
  'newDiet.gramsError': { en: 'Set correct value to grams field', pl: 'Podaj prawidłową wagę w gramach' },
  'newDiet.caloriesError': { en: 'Set correct value to calories field', pl: 'Podaj prawidłową liczbę kalorii' },
  'newDiet.proteinsError': { en: 'Set correct value to proteins field', pl: 'Podaj prawidłową ilość białka' },
  'newDiet.fatsError': { en: 'Set correct value to fats field', pl: 'Podaj prawidłową ilość tłuszczów' },
  'newDiet.carbsError': { en: 'Set correct value to carbohydrates field', pl: 'Podaj prawidłową ilość węglowodanów' },
  'newDiet.vitaminError': { en: 'Check at least one vitamin', pl: 'Zaznacz co najmniej jedną witaminę' },

  // Sets page
  'sets.yourSets': { en: 'Your Sets', pl: 'Twoje zestawy' },
  'sets.yourSetsDesc': { en: 'Manage your workout & diet combinations', pl: 'Zarządzaj swoimi kombinacjami treningów i diet' },
  'sets.publicSets': { en: 'Public Sets', pl: 'Publiczne zestawy' },
  'sets.publicSetsDesc': { en: 'Sets shared by the community', pl: 'Zestawy udostępnione przez społeczność' },
  'sets.noSets': { en: 'No sets yet', pl: 'Brak zestawów' },
  'sets.createFirst': { en: 'Create your first set to combine workouts & diets', pl: 'Utwórz swój pierwszy zestaw łącząc treningi i diety' },
  'sets.noPublic': { en: 'No public sets yet', pl: 'Brak publicznych zestawów' },
  'sets.communityWill': { en: 'Community sets will appear here', pl: 'Zestawy społeczności pojawią się tutaj' },

  // Set card
  'set.burned': { en: 'Burned', pl: 'Spalone' },
  'set.consumed': { en: 'Consumed', pl: 'Spożyte' },
  'set.time': { en: 'Time', pl: 'Czas' },
  'set.public': { en: 'Public', pl: 'Publiczny' },
  'set.workouts': { en: 'Workouts', pl: 'Treningi' },
  'set.diets': { en: 'Diets', pl: 'Diety' },
  'set.delete': { en: 'Delete set', pl: 'Usuń zestaw' },

  // New set form
  'newSet.name': { en: 'Set name', pl: 'Nazwa zestawu' },
  'newSet.namePlaceholder': { en: 'e.g. Full Body Monday', pl: 'np. Pełny trening poniedziałek' },
  'newSet.workoutsTab': { en: 'Workouts', pl: 'Treningi' },
  'newSet.dietsTab': { en: 'Diets', pl: 'Diety' },
  'newSet.selectWorkouts': { en: 'Select workouts', pl: 'Wybierz treningi' },
  'newSet.selectDiets': { en: 'Select diets', pl: 'Wybierz diety' },
  'newSet.noWorkoutsAvail': { en: 'No workouts available', pl: 'Brak dostępnych treningów' },
  'newSet.noDietsAvail': { en: 'No diets available', pl: 'Brak dostępnych diet' },
  'newSet.publicSet': { en: 'Public set', pl: 'Publiczny zestaw' },
  'newSet.submit': { en: 'Create set', pl: 'Utwórz zestaw' },
  'newSet.success': { en: 'Set created successfully!', pl: 'Zestaw utworzony pomyślnie!' },
  'newSet.failed': { en: 'Failed to create set', pl: 'Nie udało się utworzyć zestawu' },
  'newSet.fillTitle': { en: 'Fill the title field', pl: 'Wypełnij nazwę zestawu' },
  'newSet.chooseWorkout': { en: 'Choose at least 1 workout', pl: 'Wybierz co najmniej 1 trening' },
  'newSet.chooseDiet': { en: 'Choose at least 1 diet', pl: 'Wybierz co najmniej 1 dietę' },

  // Forms
  'forms.addNew': { en: 'Add new', pl: 'Dodaj nowe' },
  'forms.fillDetails': { en: 'Fill in the details below', pl: 'Wypełnij poniższe dane' },
  'forms.workoutsAndDiets': { en: 'workouts and diets', pl: 'treningi i diety' },
  'forms.setsTab': { en: 'Sets', pl: 'Zestawy' },
  'forms.workoutsAndDietsTab': { en: 'Workouts & Diets', pl: 'Treningi i diety' },

  // Calendar
  'calendar.title': { en: 'Training Calendar', pl: 'Kalendarz treningowy' },
  'calendar.subtitle': { en: 'Plan your workouts - drag sets to selected days', pl: 'Zaplanuj swoje treningi - przeciągnij sety na wybrane dni' },
  'calendar.searchSets': { en: 'Search sets...', pl: 'Szukaj setów...' },
  'calendar.dragHint': { en: 'Drag a set to a day', pl: 'Przeciągnij set na wybrany dzień' },
  'calendar.yourSets': { en: 'Your sets', pl: 'Twoje sety' },
  'calendar.noSets': { en: 'No sets', pl: 'Brak setów' },
  'calendar.publicSets': { en: 'Public sets', pl: 'Publiczne sety' },
  'calendar.noPublicSets': { en: 'No public sets', pl: 'Brak publicznych setów' },
  'calendar.saving': { en: 'Saving...', pl: 'Zapisywanie...' },

  // Calendar day names
  'calendar.mon': { en: 'Mon', pl: 'Pon' },
  'calendar.tue': { en: 'Tue', pl: 'Wt' },
  'calendar.wed': { en: 'Wed', pl: 'Śr' },
  'calendar.thu': { en: 'Thu', pl: 'Czw' },
  'calendar.fri': { en: 'Fri', pl: 'Pt' },
  'calendar.sat': { en: 'Sat', pl: 'Sob' },
  'calendar.sun': { en: 'Sun', pl: 'Ndz' },

  // Calendar month names
  'calendar.jan': { en: 'January', pl: 'Styczeń' },
  'calendar.feb': { en: 'February', pl: 'Luty' },
  'calendar.mar': { en: 'March', pl: 'Marzec' },
  'calendar.apr': { en: 'April', pl: 'Kwiecień' },
  'calendar.may': { en: 'May', pl: 'Maj' },
  'calendar.jun': { en: 'June', pl: 'Czerwiec' },
  'calendar.jul': { en: 'July', pl: 'Lipiec' },
  'calendar.aug': { en: 'August', pl: 'Sierpień' },
  'calendar.sep': { en: 'September', pl: 'Wrzesień' },
  'calendar.oct': { en: 'October', pl: 'Październik' },
  'calendar.nov': { en: 'November', pl: 'Listopad' },
  'calendar.dec': { en: 'December', pl: 'Grudzień' },

  // Register page
  'register.title': { en: 'Create your account', pl: 'Utwórz konto' },
  'register.subtitle': { en: 'Start tracking your fitness journey', pl: 'Zacznij śledzić swoją drogę do formy' },
  'register.email': { en: 'Email', pl: 'Email' },
  'register.password': { en: 'Password', pl: 'Hasło' },
  'register.passwordPlaceholder': { en: 'Min. 8 characters', pl: 'Min. 8 znaków' },
  'register.repeatPassword': { en: 'Repeat password', pl: 'Powtórz hasło' },
  'register.repeatPlaceholder': { en: 'Repeat password', pl: 'Powtórz hasło' },
  'register.submit': { en: 'Create account', pl: 'Utwórz konto' },
  'register.hasAccount': { en: 'Already have an account?', pl: 'Masz już konto?' },
  'register.signIn': { en: 'Sign in', pl: 'Zaloguj się' },
  'register.fillAll': { en: 'Fill all fields', pl: 'Wypełnij wszystkie pola' },
  'register.emailIncorrect': { en: 'Email incorrect', pl: 'Nieprawidłowy email' },
  'register.passLength': { en: 'Password need to be at least 8 char lenght', pl: 'Hasło musi mieć co najmniej 8 znaków' },
  'register.passNoMatch': { en: 'Passwords dont match', pl: 'Hasła nie pasują' },
  'register.failed': { en: 'Something went wrong', pl: 'Coś poszło nie tak' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key]
  return entry?.[locale] ?? key
}
