'use client'

import { useState, useEffect } from 'react'
import { Calculator } from 'lucide-react'

export default function EMICalculator({ carPrice }: { carPrice: number }) {
  const [price, setPrice] = useState(carPrice)
  const [downPayment, setDownPayment] = useState(Math.round(carPrice * 0.2))
  const [rate, setRate] = useState(9)
  const [tenure, setTenure] = useState(60)
  const [emi, setEmi] = useState(0)

  useEffect(() => {
    const principal = price - downPayment
    if (principal <= 0) { setEmi(0); return }
    const monthlyRate = rate / 12 / 100
    if (monthlyRate === 0) { setEmi(Math.round(principal / tenure)); return }
    const emiVal = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
    setEmi(Math.round(emiVal))
  }, [price, downPayment, rate, tenure])

  const totalAmount = emi * tenure
  const totalInterest = totalAmount - (price - downPayment)

  return (
    <div className="bg-white rounded-sm p-6 border border-gray-100">
      <h3 className="font-bold text-brand-navy text-lg mb-1 flex items-center gap-2">
        <Calculator size={18} className="text-brand-gold" />
        EMI Calculator
      </h3>
      <p className="text-gray-400 text-xs mb-5">Estimate your monthly payment</p>

      <div className="space-y-4">
        {/* Car Price */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Car Price</label>
            <span className="text-xs font-bold text-brand-navy">₹{price.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={10000}
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-full accent-brand-gold"
          />
        </div>

        {/* Down Payment */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Down Payment</label>
            <span className="text-xs font-bold text-brand-navy">₹{downPayment.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={price}
            step={10000}
            value={downPayment}
            onChange={(e) => setDownPayment(parseInt(e.target.value))}
            className="w-full accent-brand-gold"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest Rate</label>
            <span className="text-xs font-bold text-brand-navy">{rate}% p.a.</span>
          </div>
          <input
            type="range"
            min={6}
            max={20}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-brand-gold"
          />
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenure</label>
            <span className="text-xs font-bold text-brand-navy">{tenure} months ({tenure / 12} yrs)</span>
          </div>
          <input
            type="range"
            min={12}
            max={84}
            step={12}
            value={tenure}
            onChange={(e) => setTenure(parseInt(e.target.value))}
            className="w-full accent-brand-gold"
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-5 bg-brand-navy rounded-sm p-4 text-center">
        <p className="text-gray-400 text-xs mb-1">Monthly EMI</p>
        <p className="text-brand-gold font-bold text-3xl">₹{emi.toLocaleString('en-IN')}</p>
        <p className="text-gray-500 text-xs mt-1">for {tenure} months</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-brand-cream rounded-sm p-3 text-center">
          <p className="text-gray-500 text-xs">Loan Amount</p>
          <p className="text-brand-navy font-bold text-sm mt-0.5">₹{(price - downPayment).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-brand-cream rounded-sm p-3 text-center">
          <p className="text-gray-500 text-xs">Total Interest</p>
          <p className="text-brand-navy font-bold text-sm mt-0.5">₹{totalInterest.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <p className="text-gray-400 text-xs mt-3 text-center">* Indicative values only. Contact us for actual rates.</p>
    </div>
  )
}