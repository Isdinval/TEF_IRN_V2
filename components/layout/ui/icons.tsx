'use client'
import { 
  CheckCircle, Search, ArrowRight, Edit, Play, ArrowLeft, Info, Save,
  Scissors, Send, Scale, Mic, RefreshCw, Lightbulb, ChevronRight,
  X, AlertTriangle, TrendingUp, ClipboardList, Pencil, Upload
} from 'lucide-react'

export const Icons = {
  taskAlt: CheckCircle,
  search: Search,
  arrowForward: ArrowRight,
  edit: Pencil,           // ou Edit
  play: Play,
  arrowBack: ArrowLeft,
  info: Info,
  save: Save,
  textSnipper: Scissors,
  submit: Send,           // ou Upload
  accountBalance: Scale,
  mic: Mic,
  refresh: RefreshCw,
  lightbulb: Lightbulb,
  chevronRight: ChevronRight,
  checkCircle: CheckCircle,
  cancel: X,
  warning: AlertTriangle,
  trendingUp: TrendingUp,
  assignment: ClipboardList,
} as const
