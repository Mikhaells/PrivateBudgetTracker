import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip)

ChartJS.defaults.font.family = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif"
ChartJS.defaults.color = '#64748b'
