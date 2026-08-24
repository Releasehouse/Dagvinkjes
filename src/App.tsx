import { useEffect, useMemo, useState } from 'react'
import './App.css'

type DayEntry = {
  date: string
  noAlcohol: boolean
  noDrugs: boolean
  noSnacks: boolean
  exercise: boolean
}

function App() {
  const today = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(today)

  const [noAlcohol, setNoAlcohol] = useState(false)
  const [noDrugs, setNoDrugs] = useState(false)
  const [noSnacks, setNoSnacks] = useState(false)
  const [exercise, setExercise] = useState(false)

  const [history, setHistory] = useState<DayEntry[]>([])

  useEffect(() => {
    const storedHistory: DayEntry[] = JSON.parse(
      localStorage.getItem('dagVinkjesHistory') || '[]'
    )

    setHistory(storedHistory)
  }, [])

  useEffect(() => {
    const selectedEntry = history.find(
      (item) => item.date === selectedDate
    )

    if (selectedEntry) {
      setNoAlcohol(selectedEntry.noAlcohol)
      setNoDrugs(selectedEntry.noDrugs)
      setNoSnacks(selectedEntry.noSnacks)
      setExercise(selectedEntry.exercise)
    } else {
      setNoAlcohol(false)
      setNoDrugs(false)
      setNoSnacks(false)
      setExercise(false)
    }
  }, [selectedDate, history])

  const selectedEntry = history.find(
    (item) => item.date === selectedDate
  )

  const saveDay = () => {
    const day: DayEntry = {
      date: selectedDate,
      noAlcohol,
      noDrugs,
      noSnacks,
      exercise,
    }

    const newHistory = history.filter(
      (item) => item.date !== selectedDate
    )

    newHistory.push(day)

    newHistory.sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    setHistory(newHistory)

    localStorage.setItem(
      'dagVinkjesHistory',
      JSON.stringify(newHistory)
    )

    alert(
      selectedEntry
        ? 'Wijzigingen opgeslagen!'
        : 'Dag opgeslagen!'
    )
  }

  const clearChecks = () => {
    const confirmed = confirm(
      'Wil je alle vinkjes voor deze dag leegmaken?'
    )

    if (!confirmed) {
      return
    }

    setNoAlcohol(false)
    setNoDrugs(false)
    setNoSnacks(false)
    setExercise(false)
  }

  const deleteDay = () => {
    if (!selectedEntry) {
      return
    }

    const confirmed = confirm(
      'Weet je zeker dat je deze opgeslagen dag wilt verwijderen?'
    )

    if (!confirmed) {
      return
    }

    const newHistory = history.filter(
      (item) => item.date !== selectedDate
    )

    setHistory(newHistory)

    localStorage.setItem(
      'dagVinkjesHistory',
      JSON.stringify(newHistory)
    )

    setNoAlcohol(false)
    setNoDrugs(false)
    setNoSnacks(false)
    setExercise(false)

    if (selectedDate !== today) {
      setSelectedDate(today)
    }
  }

  const scoreDay = (day: DayEntry) => {
    return [
      day.noAlcohol,
      day.noDrugs,
      day.noSnacks,
      day.exercise,
    ].filter(Boolean).length
  }

  const isPerfectDay = (day: DayEntry) => {
    return scoreDay(day) === 4
  }

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) =>
      b.date.localeCompare(a.date)
    )
  }, [history])

  const lastNonPerfectDay = sortedHistory.find(
    (day) => scoreDay(day) < 4
  )

  const lastBelowThreeDay = sortedHistory.find(
    (day) => scoreDay(day) < 3
  )

  const recentHistory = sortedHistory.slice(0, 7)

  let streak = 0

  if (history.length > 0) {
    const historyByDate = new Map(
      history.map((day) => [day.date, day])
    )

    let currentDate = new Date()

    while (true) {
      const dateString =
        currentDate.toISOString().split('T')[0]

      const entry = historyByDate.get(dateString)

      if (!entry || !isPerfectDay(entry)) {
        break
      }

      streak++

      currentDate.setDate(
        currentDate.getDate() - 1
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(
      dateString + 'T12:00:00'
    )

    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(
      dateString + 'T12:00:00'
    )

    return new Intl.DateTimeFormat('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date)
  }

  const daysAgo = (dateString: string) => {
    const date = new Date(
      dateString + 'T12:00:00'
    )

    const now = new Date()

    const difference =
      now.getTime() - date.getTime()

    return Math.floor(
      difference / (1000 * 60 * 60 * 24)
    )
  }

  const selectedDateFormatted =
    new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(
      new Date(selectedDate + 'T12:00:00')
    )

  return (
    <main className="app">
      <section className="card">

        <h1>DagVinkjes</h1>

        <p className="date">
          {selectedDateFormatted}
        </p>

        {selectedDate !== today && (
          <button
            className="todayButton"
            onClick={() =>
              setSelectedDate(today)
            }
          >
            Terug naar vandaag
          </button>
        )}

        <div className="checks">

          <label>
            <input
              type="checkbox"
              checked={noAlcohol}
              onChange={(e) =>
                setNoAlcohol(e.target.checked)
              }
            />
            <span>Geen drank</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={noDrugs}
              onChange={(e) =>
                setNoDrugs(e.target.checked)
              }
            />
            <span>Geen drugs</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={noSnacks}
              onChange={(e) =>
                setNoSnacks(e.target.checked)
              }
            />
            <span>
              Geen vette tussendoortjes
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={exercise}
              onChange={(e) =>
                setExercise(e.target.checked)
              }
            />
            <span>
              30+ minuten bewegen
            </span>
          </label>

        </div>

        <button
          className="saveButton"
          onClick={saveDay}
        >
          {selectedEntry
            ? 'Wijzigingen opslaan'
            : 'Dag opslaan'}
        </button>

        <button
          className="resetButton"
          onClick={clearChecks}
        >
          Vinkjes leegmaken
        </button>

        {selectedEntry && (
          <button
            className="deleteButton"
            onClick={deleteDay}
          >
            Dag verwijderen
          </button>
        )}

        <div className="stats">

          <div className="statBlock highlightBlock">
            <span className="statLabel">
              🔥 Huidige 4/4 reeks
            </span>

            <strong className="statValue">
              {streak}{' '}
              {streak === 1
                ? 'dag'
                : 'dagen'}
            </strong>
          </div>

          <div className="statBlock">
            <span className="statLabel">
              Laatste dag zonder 4/4
            </span>

            {lastNonPerfectDay ? (
              <>
                <strong className="statValue">
                  {formatDate(
                    lastNonPerfectDay.date
                  )}
                </strong>

                <span className="statSub">
                  {scoreDay(
                    lastNonPerfectDay
                  )}
                  /4 vinkjes
                  {' · '}
                  {daysAgo(
                    lastNonPerfectDay.date
                  )}{' '}
                  dagen geleden
                </span>
              </>
            ) : (
              <strong className="statValue">
                Nog geen
              </strong>
            )}
          </div>

          <div className="statBlock">
            <span className="statLabel">
              Laatste dag zonder minimaal 3/4
            </span>

            {lastBelowThreeDay ? (
              <>
                <strong className="statValue">
                  {formatDate(
                    lastBelowThreeDay.date
                  )}
                </strong>

                <span className="statSub">
                  {scoreDay(
                    lastBelowThreeDay
                  )}
                  /4 vinkjes
                  {' · '}
                  {daysAgo(
                    lastBelowThreeDay.date
                  )}{' '}
                  dagen geleden
                </span>
              </>
            ) : (
              <strong className="statValue">
                Nog geen
              </strong>
            )}
          </div>

        </div>

        <div className="historySection">

          <div className="historyHeader">
            <h2>Laatste 7 dagen</h2>
            <span>Klik om aan te passen</span>
          </div>

          {recentHistory.length === 0 ? (
            <p className="emptyHistory">
              Nog geen dagen opgeslagen.
            </p>
          ) : (
            <div className="historyList">

              {recentHistory.map((day) => {
                const score = scoreDay(day)

                return (
                  <button
                    key={day.date}
                    className={
                      selectedDate === day.date
                        ? 'historyRow selectedHistoryRow'
                        : 'historyRow'
                    }
                    onClick={() =>
                      setSelectedDate(day.date)
                    }
                  >

                    <div className="historyDate">
                      {formatDateShort(
                        day.date
                      )}
                    </div>

                    <div className="historyChecks">

                      <span
                        className={
                          day.noAlcohol
                            ? 'miniCheck active'
                            : 'miniCheck'
                        }
                        title="Geen drank"
                      >
                        ✓
                      </span>

                      <span
                        className={
                          day.noDrugs
                            ? 'miniCheck active'
                            : 'miniCheck'
                        }
                        title="Geen drugs"
                      >
                        ✓
                      </span>

                      <span
                        className={
                          day.noSnacks
                            ? 'miniCheck active'
                            : 'miniCheck'
                        }
                        title="Geen vette tussendoortjes"
                      >
                        ✓
                      </span>

                      <span
                        className={
                          day.exercise
                            ? 'miniCheck active'
                            : 'miniCheck'
                        }
                        title="30+ minuten bewegen"
                      >
                        ✓
                      </span>

                    </div>

                    <strong
                      className={
                        score === 4
                          ? 'historyScore perfectScore'
                          : score >= 3
                          ? 'historyScore goodScore'
                          : 'historyScore lowScore'
                      }
                    >
                      {score}/4
                    </strong>

                  </button>
                )
              })}

            </div>
          )}

        </div>

      </section>
    </main>
  )
}

export default App