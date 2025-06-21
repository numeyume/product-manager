import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './StorageManager.css';

interface StorageManagerProps {
  onClose: () => void;
}

interface StorageStructure {
  [level1: string]: {
    [level2: string]: string[];
  };
}

export const StorageManager: React.FC<StorageManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [storageData, setStorageData] = useState<StorageStructure>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLevel1, setNewLevel1] = useState('');
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [newLevel2, setNewLevel2] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [newLevel3, setNewLevel3] = useState('');

  useEffect(() => {
    loadStorageData();
  }, [user]);

  const loadStorageData = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, `users/${user.uid}/settings`, 'storage');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStorageData(docSnap.data() as StorageStructure);
      } else {
        const defaultData: StorageStructure = {
          '押入れ': {
            '上段': ['ボックスA', 'ボックスB'],
            '下段': ['ボックスC', 'ボックスD']
          },
          'クローゼット': {
            '棚': ['左側', '右側'],
            '引き出し': ['1段目', '2段目']
          }
        };
        setStorageData(defaultData);
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStorageData = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, 'storage'), storageData);
      alert('保存しました');
    } catch (error) {
      console.error('Error saving storage data:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const addLevel1 = () => {
    if (!newLevel1.trim()) return;
    
    setStorageData({
      ...storageData,
      [newLevel1]: {}
    });
    setNewLevel1('');
  };

  const addLevel2 = () => {
    if (!selectedLevel1 || !newLevel2.trim()) return;
    
    setStorageData({
      ...storageData,
      [selectedLevel1]: {
        ...storageData[selectedLevel1],
        [newLevel2]: []
      }
    });
    setNewLevel2('');
  };

  const addLevel3 = () => {
    if (!selectedLevel1 || !selectedLevel2 || !newLevel3.trim()) return;
    
    const currentLevel3 = storageData[selectedLevel1][selectedLevel2] || [];
    
    setStorageData({
      ...storageData,
      [selectedLevel1]: {
        ...storageData[selectedLevel1],
        [selectedLevel2]: [...currentLevel3, newLevel3]
      }
    });
    setNewLevel3('');
  };

  const deleteLevel3 = (level1: string, level2: string, level3: string) => {
    const newLevel3Array = storageData[level1][level2].filter(item => item !== level3);
    
    setStorageData({
      ...storageData,
      [level1]: {
        ...storageData[level1],
        [level2]: newLevel3Array
      }
    });
  };

  if (loading) {
    return <div className="modal-overlay"><div className="loading">読み込み中...</div></div>;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="storage-manager" onClick={e => e.stopPropagation()}>
        <h2>保管場所管理</h2>
        
        <div className="storage-section">
          <h3>場所1を追加</h3>
          <div className="input-group">
            <input
              type="text"
              value={newLevel1}
              onChange={e => setNewLevel1(e.target.value)}
              placeholder="例: 押入れ"
            />
            <button onClick={addLevel1}>追加</button>
          </div>
        </div>

        <div className="storage-section">
          <h3>場所2を追加</h3>
          <div className="input-group">
            <select
              value={selectedLevel1}
              onChange={e => setSelectedLevel1(e.target.value)}
            >
              <option value="">場所1を選択</option>
              {Object.keys(storageData).map(level1 => (
                <option key={level1} value={level1}>{level1}</option>
              ))}
            </select>
            <input
              type="text"
              value={newLevel2}
              onChange={e => setNewLevel2(e.target.value)}
              placeholder="例: 上段"
              disabled={!selectedLevel1}
            />
            <button onClick={addLevel2} disabled={!selectedLevel1}>追加</button>
          </div>
        </div>

        <div className="storage-section">
          <h3>場所3を追加</h3>
          <div className="input-group">
            <select
              value={selectedLevel1}
              onChange={e => {
                setSelectedLevel1(e.target.value);
                setSelectedLevel2('');
              }}
            >
              <option value="">場所1を選択</option>
              {Object.keys(storageData).map(level1 => (
                <option key={level1} value={level1}>{level1}</option>
              ))}
            </select>
            <select
              value={selectedLevel2}
              onChange={e => setSelectedLevel2(e.target.value)}
              disabled={!selectedLevel1}
            >
              <option value="">場所2を選択</option>
              {selectedLevel1 && Object.keys(storageData[selectedLevel1] || {}).map(level2 => (
                <option key={level2} value={level2}>{level2}</option>
              ))}
            </select>
            <input
              type="text"
              value={newLevel3}
              onChange={e => setNewLevel3(e.target.value)}
              placeholder="例: ボックスA"
              disabled={!selectedLevel2}
            />
            <button onClick={addLevel3} disabled={!selectedLevel2}>追加</button>
          </div>
        </div>

        <div className="storage-tree">
          <h3>現在の保管場所</h3>
          {Object.entries(storageData).map(([level1, level2Data]) => (
            <div key={level1} className="tree-level1">
              <strong>{level1}</strong>
              {Object.entries(level2Data).map(([level2, level3Array]) => (
                <div key={level2} className="tree-level2">
                  <span>└ {level2}</span>
                  {level3Array.map(level3 => (
                    <div key={level3} className="tree-level3">
                      <span>　└ {level3}</span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteLevel3(level1, level2, level3)}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">閉じる</button>
          <button onClick={saveStorageData} disabled={saving} className="save-btn">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};